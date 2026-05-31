from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models.exchange_mid_rate import ExchangeMidRate
from db.repositories.base import AsyncRepository

class ExchangeMidRateRepository(
    AsyncRepository[ExchangeMidRate]
):
    model = ExchangeMidRate

    async def get_currency_rates(self,currency_id: int,) -> list[ExchangeMidRate]:
        stmt = (
            select(ExchangeMidRate)
            .where(ExchangeMidRate.currency_id == currency_id)
            .order_by(ExchangeMidRate.effective_date.desc())
        )

        result = await self.session.scalars(stmt)

        return list(result.all())

    async def get_rate(self, currency_id: int, effective_date: date,) -> ExchangeMidRate | None:

        stmt = (
            select(ExchangeMidRate)
            .where(
                ExchangeMidRate.currency_id == currency_id,
                ExchangeMidRate.effective_date == effective_date,
            )
        )

        return await self.session.scalar(stmt)