from datetime import date
from sqlalchemy import select
from db.models.exchange_buy_and_sell_rate import ExchangeBuyAndSellRate
from db.repositories.base import AsyncRepository


class ExchangeBuySellRateRepository(
    AsyncRepository[ExchangeBuyAndSellRate]
):
    model = ExchangeBuyAndSellRate

    async def get_rate(self,currency_id: int,effective_date: date,) -> ExchangeBuyAndSellRate | None:

        stmt = (
            select(ExchangeBuyAndSellRate)
            .where(
                ExchangeBuyAndSellRate.currency_id == currency_id,
                ExchangeBuyAndSellRate.effective_date == effective_date,
            )
        )

        return await self.session.scalar(stmt)