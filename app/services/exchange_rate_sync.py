from dto.exchange_rate_dto import BuyAndSellRateCreateDTO, MidRateCreateDTO
from integrations.NBP.currency_service import dto_to_entity
from db.models.currency import Currency
from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository

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

        currencies = (await self.currency_repo.get_all())

        currency_map = {
            c.code: c
            for c in currencies
        }

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

        currencies = (await self.currency_repo.get_all())

        currency_map = {
            c.code: c
            for c in currencies
        }

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

        for rate in dto.rates:
            if hasattr(rate, 'bid'):
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

        await self.session.commit()

        return False