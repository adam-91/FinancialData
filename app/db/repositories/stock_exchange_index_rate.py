from datetime import date

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from db.models.stock_exchange_index import StockExchangeIndex
from db.models.stock_exchange_index_rate import StockExchangeIndexRate
from db.repositories.base import AsyncRepository
from dto.stock_exchange_dto import (
    StockExchangeIndexRateCreateDTO,
    StockExchangeIndexRateDTO,
)


class StockExchangeIndexRateRepository(
    AsyncRepository[
        StockExchangeIndexRate,
        StockExchangeIndexRateCreateDTO,
        StockExchangeIndexRateDTO,
    ]
):
    model = StockExchangeIndexRate
    output_schema = StockExchangeIndexRateDTO

    async def get_rates_for_period(
        self, index_id: int, start_date: date, end_date: date
    ) -> list[StockExchangeIndexRate]:
        stmt = (
            select(StockExchangeIndexRate)
            .where(StockExchangeIndexRate.index_id == index_id)
            .where(StockExchangeIndexRate.trading_date.between(start_date, end_date))
            .order_by(StockExchangeIndexRate.trading_date.asc())
        )

        result = await self.session.scalars(stmt)
        return list(result.all())

    async def get_data_range_by_index(self, index_id: int) -> dict | None:
        stmt = select(
            func.min(StockExchangeIndexRate.trading_date).label("min_date"),
            func.max(StockExchangeIndexRate.trading_date).label("max_date"),
            func.count(StockExchangeIndexRate.id).label("count"),
        ).where(StockExchangeIndexRate.index_id == index_id)

        result = await self.session.execute(stmt)
        row = result.first()

        if row and row.count > 0:
            return {
                "min_date": row.min_date,
                "max_date": row.max_date,
                "count": row.count,
            }
        return None

    async def get_all_indexes_data_summary(self) -> list[dict]:
        stmt = (
            select(
                StockExchangeIndex.id,
                StockExchangeIndex.symbol,
                StockExchangeIndex.name,
                func.min(StockExchangeIndexRate.trading_date).label("min_date"),
                func.max(StockExchangeIndexRate.trading_date).label("max_date"),
                func.count(StockExchangeIndexRate.id).label("count"),
            )
            .outerjoin(
                StockExchangeIndexRate,
                StockExchangeIndex.id == StockExchangeIndexRate.index_id,
            )
            .group_by(
                StockExchangeIndex.id,
                StockExchangeIndex.symbol,
                StockExchangeIndex.name,
            )
            .order_by(StockExchangeIndex.symbol)
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

    async def get_rates_paginated(
        self, index_id: int, page: int, page_size: int
    ) -> tuple[list[StockExchangeIndexRate], int]:
        count_stmt = select(func.count(StockExchangeIndexRate.id)).where(
            StockExchangeIndexRate.index_id == index_id
        )
        total = await self.session.scalar(count_stmt) or 0

        offset = (page - 1) * page_size
        stmt = (
            select(StockExchangeIndexRate)
            .where(StockExchangeIndexRate.index_id == index_id)
            .order_by(StockExchangeIndexRate.trading_date.desc())
            .offset(offset)
            .limit(page_size)
        )

        result = await self.session.scalars(stmt)
        rates = list(result.all())

        return rates, total

    async def bulk_upsert(self, rates: list[dict]) -> int:
        if not rates:
            return 0

        stmt = pg_insert(StockExchangeIndexRate).values(rates)
        update_dict = {
            c.name: stmt.excluded[c.name]
            for c in stmt.excluded
            if c.name not in ("id", "index_id", "trading_date")
        }
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=["index_id", "trading_date"],
            set_=update_dict,
        )
        result = await self.session.execute(upsert_stmt)
        await self.session.commit()
        return result.rowcount
