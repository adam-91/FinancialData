from db.models.currency import Currency

from db.repositories.currency import (
    CurrencyRepository,
)

from db.repositories.exchange_mid_rate import (
    ExchangeRateMidRepository,
)
from db.repositories.exchange_buy_and_sell_rate import (
    ExchangeRateBuyAndSellRepository,
)


class ExchangeRateSyncService:

    def __init__(self, session):

        self.session = session

        self.currency_repo = CurrencyRepository(
            session
        )

        self.rate_mid_repo = ExchangeRateMidRepository(
            session
        )

        self.rate_bas_repo = ExchangeRateBuyAndSellRepository(
            session
        )

    async def sync(
        self,
        dto,
    ) -> int:

        currencies = (
            await self.currency_repo.get_all()
        )

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

            await self.currency_repo.add_many(
                missing
            )

            await self.session.flush()

            currencies = (
                await self.currency_repo.get_all()
            )

            currency_map = {
                c.code: c
                for c in currencies
            }

        rows_mid = [
            {
                "currency_id": currency_map[
                    rate.code
                ].id,
                "effective_date": dto.effective_date,
                "mid": rate.mid,
            }
            for rate in dto.rates if hasattr(rate, 'mid')
        ]

        await self.rate_repo.upsert(rows_mid)

        rows_bas = [
            {
                "currency_id": currency_map[
                    rate.code
                ].id,
                "effective_date": dto.effective_date,
                "bid": rate.bid,
                "ask": rate.ask,
            }
            for rate in dto.rates if hasattr(rate, 'bid')
        ]

        await self.rate_repo.upsert(rows_bas)

        await self.session.commit()

        return len(rows_mid + rows_bas)