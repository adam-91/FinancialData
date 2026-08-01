from datetime import date

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import joinedload, subqueryload

from db.models.stock_company import StockCompany
from db.models.stock_index_membership import StockIndexMembership
from db.models.stock_price import StockPrice
from db.repositories.base import AsyncRepository
from dto.stock_price_dto import (
    StockPriceCreateDTO,
    StockPriceDTO,
    StockPriceFullDTO,
)


class StockPriceRepository(
    AsyncRepository[StockPrice, StockPriceCreateDTO, StockPriceDTO | StockPriceFullDTO]
):
    model = StockPrice
    output_schema = StockPriceDTO | StockPriceFullDTO

    async def get_stock_price(
        self, company_id: int, date: date | None = None, with_stock: bool = False
    ) -> StockPriceDTO | StockPriceFullDTO | None:

        stmt = select(StockPriceDTO)
        if with_stock:
            stmt = stmt.options(joinedload(StockPrice.stock))
        stmt = stmt.where(StockPriceDTO.company_id == company_id)
        if date is None:
            stmt = stmt.order_by(StockPrice.trading_date.desc())
            stmt = stmt.limit(1)
        else:
            stmt = stmt.where(StockPriceDTO.trading_date == date)

        result = await self.session.scalar(stmt)
        db_model = result.scalar_one_or_none()

        if not db_model:
            return None

        if with_stock:
            return StockPriceFullDTO.model_validate(db_model)

        return StockPriceDTO.model_validate(db_model)

    async def get_stock_price_by_symbol(
        self, symbol: str, date: date, yahoo=True, with_stock: bool = False
    ) -> StockPriceDTO | StockPriceFullDTO | None:
        stmt = select(StockPriceDTO).options(joinedload(StockPrice.stock))
        if yahoo:
            stmt = stmt.where(StockCompany.yahoo_symbol == symbol)
        else:
            stmt = stmt.where(StockCompany.symbol == symbol)
        stmt = stmt.where(
            StockPriceDTO.trading_date == date,
        )

        result = await self.session.scalar(stmt)
        db_model = result.scalar_one_or_none()

        if not db_model:
            return None

        if with_stock:
            return StockPriceFullDTO.model_validate(db_model)

        return StockPriceDTO.model_validate(db_model)

    async def get_stock_price_from_period(
        self, company_id: int, start_date: date, end_date: date
    ) -> StockPriceDTO | None:
        stmt = select(StockPriceDTO)
        stmt = stmt.where(StockPriceDTO.company_id == company_id)
        stmt = stmt.where(StockPriceDTO.trading_date.between(start_date, end_date))

        return await self.session.scalar(stmt)

    async def get_stock_price_from_period_by_symbol(
        self, symbol: str, start_date: date, end_date: date, yahoo=True
    ) -> StockPriceDTO | None:
        stmt = select(StockPriceDTO)
        if yahoo:
            stmt = stmt.where(StockPriceDTO.yahoo_symbol == symbol)
        else:
            stmt = stmt.where(StockPriceDTO.symbol == symbol)
        stmt = stmt.where(StockPriceDTO.trading_date.between(start_date, end_date))

        return await self.session.scalar(stmt)

    async def get_prices_for_period(
        self, company_id: int, start_date: date, end_date: date
    ) -> list[StockPrice]:
        stmt = (
            select(StockPrice)
            .where(StockPrice.company_id == company_id)
            .where(StockPrice.trading_date.between(start_date, end_date))
            .order_by(StockPrice.trading_date.asc())
        )

        result = await self.session.scalars(stmt)
        return list(result.all())

    async def get_all_latest_prices(self) -> list[tuple[StockCompany, StockPrice]]:
        latest_dates_subq = (
            select(
                StockPrice.company_id,
                StockPrice.trading_date,
            )
            .order_by(StockPrice.company_id, StockPrice.trading_date.desc())
            .distinct()
            .subquery()
        )

        stmt = (
            select(StockCompany, StockPrice)
            .join(StockPrice, StockCompany.id == StockPrice.company_id)
            .join(
                latest_dates_subq,
                (StockPrice.company_id == latest_dates_subq.c.company_id)
                & (StockPrice.trading_date == latest_dates_subq.c.trading_date),
            )
            .options(
                joinedload(StockCompany.stock_exchange),
                subqueryload(StockCompany.stock_index_memberships).joinedload(
                    StockIndexMembership.stock_index
                ),
            )
            .where(StockCompany.active)
            .order_by(StockCompany.symbol)
        )

        result = await self.session.execute(stmt)
        rows = result.all()

        seen = set()
        unique_rows = []
        for company, price in rows:
            if company.id not in seen:
                seen.add(company.id)
                unique_rows.append((company, price))

        return unique_rows

    async def get_data_range_by_company(self, company_id: int) -> dict | None:
        stmt = select(
            func.min(StockPrice.trading_date).label("min_date"),
            func.max(StockPrice.trading_date).label("max_date"),
            func.count(StockPrice.id).label("count"),
        ).where(StockPrice.company_id == company_id)

        result = await self.session.execute(stmt)
        row = result.first()

        if row and row.count > 0:
            return {
                "min_date": row.min_date,
                "max_date": row.max_date,
                "count": row.count,
            }
        return None

    async def get_all_companies_data_summary(self) -> list[dict]:
        stmt = (
            select(
                StockCompany.id,
                StockCompany.symbol,
                StockCompany.name,
                func.min(StockPrice.trading_date).label("min_date"),
                func.max(StockPrice.trading_date).label("max_date"),
                func.count(StockPrice.id).label("count"),
            )
            .outerjoin(StockPrice, StockCompany.id == StockPrice.company_id)
            .where(StockCompany.active)
            .group_by(StockCompany.id, StockCompany.symbol, StockCompany.name)
            .order_by(StockCompany.symbol)
        )

        result = await self.session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.id,
                "symbol": row.symbol,
                "name": row.name,
                "min_date": row.min_date,
                "max_date": row.max_date,
                "count": row.count,
            }
            for row in rows
        ]

    async def get_prices_paginated(
        self, company_id: int, page: int, page_size: int
    ) -> tuple[list[StockPrice], int]:
        count_stmt = select(func.count(StockPrice.id)).where(
            StockPrice.company_id == company_id
        )
        total = await self.session.scalar(count_stmt) or 0

        offset = (page - 1) * page_size
        stmt = (
            select(StockPrice)
            .where(StockPrice.company_id == company_id)
            .order_by(StockPrice.trading_date.desc())
            .offset(offset)
            .limit(page_size)
        )

        result = await self.session.scalars(stmt)
        prices = list(result.all())

        return prices, total

    async def bulk_upsert(self, prices: list[dict]) -> int:
        if not prices:
            return 0

        stmt = pg_insert(StockPrice).values(prices)
        update_dict = {
            c.name: stmt.excluded[c.name]
            for c in stmt.excluded
            if c.name not in ("id", "company_id", "trading_date")
        }
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=["company_id", "trading_date"],
            set_=update_dict,
        )
        result = await self.session.execute(upsert_stmt)
        await self.session.commit()
        return result.rowcount
