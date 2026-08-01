import logging

from db.models.currency import Currency
from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from dto.exchange_rate_dto import BuyAndSellRateCreateDTO, MidRateCreateDTO
from integrations.NBP.currency_service import dto_to_entity

logger = logging.getLogger(__name__)


class ExchangeRateSyncService:
    def __init__(self, session):
        self.session = session
        self.currency_repo = CurrencyRepository(session)
        self.rate_mid_repo = ExchangeMidRateRepository(session)
        self.rate_bas_repo = ExchangeBuySellRateRepository(session)

    async def sync(
        self,
        dto,
    ) -> int:
        logger.info("Starting exchange rate sync", table=dto.table)

        currencies = await self.currency_repo.get_all()
        currency_map = {c.code: c for c in currencies}

        missing = []

        for rate in dto.rates:
            if rate.code not in currency_map:
                currency = Currency(
                    code=rate.code,
                    name=rate.currency,
                )
                missing.append(currency)

        if missing:
            await self.currency_repo.create_many(missing)
            await self.session.flush()
            logger.info("Added new currencies", count=len(missing))

        currencies = await self.currency_repo.get_all()
        currency_map = {c.code: c for c in currencies}

        mid_count = 0
        for rate in dto.rates:
            if hasattr(rate, "mid"):
                dto_rate = MidRateCreateDTO(
                    currency=rate.currency,
                    code=rate.code,
                    mid=rate.mid,
                    effective_date=dto.effectiveDate,
                )

                entity = dto_to_entity(
                    dto_rate,
                    currency_map[rate.code].id,
                )

                await self.rate_mid_repo.upsert(entity)
                mid_count += 1

        buy_sell_count = 0
        for rate in dto.rates:
            if hasattr(rate, "bid"):
                dto_rate = BuyAndSellRateCreateDTO(
                    currency=rate.currency,
                    code=rate.code,
                    bid=rate.bid,
                    ask=rate.ask,
                    effective_date=dto.effectiveDate,
                )

                entity = dto_to_entity(
                    dto_rate,
                    currency_map[rate.code].id,
                )

                await self.rate_bas_repo.upsert(entity)
                buy_sell_count += 1

        await self.session.commit()

        logger.info(
            "Completed exchange rate sync",
            table=dto.table,
            mid_rates=mid_count,
            buy_sell_rates=buy_sell_count,
        )

        return False
