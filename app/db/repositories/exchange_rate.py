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
            print(currency_code)
            raise ValueError(f"Currency {currency_code} not found")

        mid = await self.mid_repo.get_rate(
            currency.id,
            effective_date,
        )

        buy_sell = (await self.buy_sell_repo.get_rate(
                currency.id,
                effective_date,
            )
        )

        return {
            "code": currency.code,
            "currency": currency.name,
            "effectiveDate": effective_date,
            "mid":
                mid.mid if mid else None,
            "bid":
                buy_sell.bid if buy_sell else None,
            "ask":
                buy_sell.ask if buy_sell else None,
        }
    

