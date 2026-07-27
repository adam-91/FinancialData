from datetime import date

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

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
