from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db.models.exchange_mid_rate import ExchangeMidRate
from db.repositories.base import AsyncRepository
from dto.exchange_rate_dto import MidRateCreateDTO, MidRateDTO


class ExchangeMidRateRepository(
    AsyncRepository[ExchangeMidRate, MidRateCreateDTO, MidRateDTO]
):
    model = ExchangeMidRate
    output_schema = MidRateDTO

    async def get_currency_rates(
        self,
        currency_id: int,
    ) -> list[ExchangeMidRate]:
        stmt = (
            select(ExchangeMidRate)
            .where(ExchangeMidRate.currency_id == currency_id)
            .order_by(ExchangeMidRate.effective_date.desc())
        )

        result = await self.session.scalars(stmt)

        return list(result.all())

    async def get_rate(
        self,
        currency_id: int,
        effective_date: date,
    ) -> ExchangeMidRate | None:

        stmt = select(ExchangeMidRate).where(
            ExchangeMidRate.currency_id == currency_id,
            ExchangeMidRate.effective_date == effective_date,
        )

        return await self.session.scalar(stmt)

    async def upsert(self, mid_rate_object: ExchangeMidRate) -> ExchangeMidRate:
        existing = await self.session.scalar(
            select(ExchangeMidRate).where(
                ExchangeMidRate.currency_id == mid_rate_object.currency_id,
                ExchangeMidRate.effective_date == mid_rate_object.effective_date,
            )
        )

        if existing:
            existing.mid = mid_rate_object.mid
            return existing

        self.session.add(mid_rate_object)
        return mid_rate_object

    async def get_rates_for_period(
        self, currency_id: int, start_date: date, end_date: date
    ) -> list[ExchangeMidRate]:
        stmt = (
            select(ExchangeMidRate)
            .where(ExchangeMidRate.currency_id == currency_id)
            .where(ExchangeMidRate.effective_date.between(start_date, end_date))
            .order_by(ExchangeMidRate.effective_date.asc())
        )

        result = await self.session.scalars(stmt)
        return list(result.all())

    async def get_latest_rate(
        self,
        currency_id: int,
    ) -> ExchangeMidRate | None:

        stmt = (
            select(ExchangeMidRate)
            .where(ExchangeMidRate.currency_id == currency_id)
            .order_by(ExchangeMidRate.effective_date.desc())
            .limit(1)
        )

        return await self.session.scalar(stmt)

    async def get_all_with_currency(self) -> list[ExchangeMidRate]:
        stmt = select(ExchangeMidRate).options(selectinload(ExchangeMidRate.currency))

        result = await self.session.scalars(stmt)
        return list(result.all())
