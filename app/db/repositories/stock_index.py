from datetime import date, datetime

from sqlalchemy import delete, insert, select
from sqlalchemy.orm import joinedload

from db.models.stock_company import StockCompany
from db.models.stock_exchange_index import StockExchangeIndex
from db.models.stock_exchange_index_rate import StockExchangeIndexRate
from db.models.stock_index_membership import StockIndexMembership
from db.repositories.base import AsyncRepository
from dto.stock_company_dto import StockCompanyDTO
from dto.stock_exchange_dto import (
    StockExchangeIndexCreateDTO,
    StockExchangeIndexDTO,
    StockExchangeIndexRateDTO,
)


class StockIndexRepository(
    AsyncRepository[
        StockExchangeIndex, StockExchangeIndexCreateDTO, StockExchangeIndexDTO
    ]
):
    model = StockExchangeIndex
    output_schema = StockExchangeIndexDTO

    async def get_exchange_index(
        self, identyfier: int | str
    ) -> StockExchangeIndexDTO | None:
        stmt = select(StockExchangeIndexDTO)
        if isinstance(identyfier, int):
            stmt = stmt.where(StockExchangeIndexDTO.id == identyfier)
        elif isinstance(identyfier, str):
            stmt = stmt.where(StockExchangeIndexDTO.symbol == identyfier)

        result = await self.session.scalar(stmt)
        db_model = result.scalar_one_or_none()

        if not db_model:
            return None

        return StockExchangeIndexDTO.model_validate(db_model)

    async def get_exchange_indexes(
        self, stock_exchange: str | None = None
    ) -> list[StockExchangeIndexDTO] | None:

        stmt = select(StockExchangeIndex)
        if stock_exchange is not None:
            stmt = stmt.where(StockExchangeIndex.stock_exchange == stock_exchange)

        result = await self.session.scalar(stmt)
        db_model = result.scalars().all()

        if not db_model:
            return None

        return [StockExchangeIndexDTO.model_validate(item) for item in db_model]

    async def get_exchange_index_rates(
        self, index: int | list[int] | str, trading_date: date | None = None
    ) -> list[StockExchangeIndexRateDTO] | None:
        stmt = select(StockExchangeIndexRate)
        limit = 1
        if isinstance(index, int):
            stmt = stmt.where(StockExchangeIndexRate.index_id == index)
        elif isinstance(index, list[int]):
            limit = len(index)
            stmt = stmt.where(StockExchangeIndexRate.index_id._in(index))
        elif isinstance(index, str):
            stmt = stmt.options(joinedload(StockExchangeIndex.name))
            stmt = stmt.where(StockExchangeIndex.name == index)

        if date is None:
            stmt = stmt.order_by(StockExchangeIndexRate.trading_date.desc())
            stmt = stmt.limit(limit)

        result = await self.session.scalar(stmt)
        db_model = result.scalar().all()

        if not db_model:
            return None

        return StockExchangeIndexRateDTO.model_validate(db_model)

    async def add_companies_to_index(
        self, index_id: int, company_ids: list[int]
    ) -> int:
        if not company_ids:
            return 0

        existing_stmt = select(StockIndexMembership.company_id).where(
            StockIndexMembership.index_id == index_id,
            StockIndexMembership.company_id.in_(company_ids),
        )
        result = await self.session.execute(existing_stmt)
        existing_ids = set(result.scalars().all())

        new_memberships = [
            {
                "index_id": index_id,
                "company_id": cid,
                "joined_at": datetime.now(),
                "left_at": None,
                "active": True,
            }
            for cid in company_ids
            if cid not in existing_ids
        ]

        if new_memberships:
            stmt = insert(StockIndexMembership).values(new_memberships)
            await self.session.execute(stmt)
            await self.session.commit()

        return len(new_memberships)

    async def remove_companies_from_index(
        self, index_id: int, company_ids: list[int]
    ) -> int:
        if not company_ids:
            return 0

        stmt = delete(StockIndexMembership).where(
            StockIndexMembership.index_id == index_id,
            StockIndexMembership.company_id.in_(company_ids),
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount

    async def get_index_companies(self, index_id: int) -> list[StockCompanyDTO]:
        stmt = select(StockCompany)
        stmt = stmt.join(
            StockIndexMembership,
            StockCompany.id == StockIndexMembership.company_id,
        )
        stmt = stmt.where(StockIndexMembership.index_id == index_id)
        stmt = stmt.where(StockIndexMembership.active)
        stmt = stmt.where(StockCompany.active)

        result = await self.session.execute(stmt)
        companies = result.scalars().all()

        return [StockCompanyDTO.model_validate(c) for c in companies]
