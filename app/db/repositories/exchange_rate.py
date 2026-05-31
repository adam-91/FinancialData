from datetime import date

from db.repositories.currency import (CurrencyRepository)
from db.repositories.exchange_mid_rate import (ExchangeMidRateRepository)
from db.repositories.exchange_buy_and_sell_rate import (ExchangeBuySellRateRepository)


class ExchangeRateService:

    def __init__(
        self,
        currency_repo: CurrencyRepository,
        mid_repo: ExchangeMidRateRepository,
        buy_sell_repo: ExchangeBuySellRateRepository,
    ):
        self.currency_repo = currency_repo
        self.mid_repo = mid_repo
        self.buy_sell_repo = buy_sell_repo

    async def get_rate(
        self,
        currency_code: str,
        effective_date: date,
    ):

        currency = (await self.currency_repo.get_by_code(currency_code))

        if currency is None:
            raise ValueError(f"Currency {currency_code} not found")

        mid_rate = await self.mid_repo.get_rate(
            currency.id,
            effective_date,
        )

        buy_sell_rate = (await self.buy_sell_repo.get_rate(
                currency.id,
                effective_date,
            )
        )

        return {
            "currency": currency.code,
            "date": effective_date,
            "mid_rate":
                mid_rate.mid_rate
                if mid_rate
                else None,
            "buy_rate":
                buy_sell_rate.buy_rate
                if buy_sell_rate
                else None,
            "sell_rate":
                buy_sell_rate.sell_rate
                if buy_sell_rate
                else None,
        }