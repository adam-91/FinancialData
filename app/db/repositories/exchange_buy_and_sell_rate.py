from datetime import date

from sqlalchemy import select

from db.models.exchange_buy_and_sell_rate import ExchangeBuyAndSellRate
from db.repositories.base import AsyncRepository
from dto.exchange_rate_dto import BuyAndSellRateCreateDTO, BuyAndSellRateDTO


class ExchangeBuySellRateRepository(
    AsyncRepository[ExchangeBuyAndSellRate, BuyAndSellRateCreateDTO, BuyAndSellRateDTO]
):
    model = ExchangeBuyAndSellRate
    output_schema = BuyAndSellRateDTO

    async def get_rate(
        self,
        currency_id: int,
        effective_date: date,
    ) -> ExchangeBuyAndSellRate | None:

        stmt = select(ExchangeBuyAndSellRate).where(
            ExchangeBuyAndSellRate.currency_id == currency_id,
            ExchangeBuyAndSellRate.effective_date == effective_date,
        )

        return await self.session.scalar(stmt)

    async def upsert(
        self, bas_rate_object: ExchangeBuyAndSellRate
    ) -> ExchangeBuyAndSellRate:
        existing = await self.session.scalar(
            select(ExchangeBuyAndSellRate).where(
                ExchangeBuyAndSellRate.currency_id == bas_rate_object.currency_id,
                ExchangeBuyAndSellRate.effective_date == bas_rate_object.effective_date,
            )
        )

        if existing:
            existing.bid = bas_rate_object.bid
            existing.ask = bas_rate_object.ask

            return existing

        self.session.add(bas_rate_object)

        return bas_rate_object

    async def get_latest_rate(
        self,
        currency_id: int,
    ) -> ExchangeBuyAndSellRate | None:

        stmt = (
            select(ExchangeBuyAndSellRate)
            .where(ExchangeBuyAndSellRate.currency_id == currency_id)
            .order_by(ExchangeBuyAndSellRate.effective_date.desc())
            .limit(1)
        )

        return await self.session.scalar(stmt)
