from datetime import date

from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from dto.currency_history_response import (
    CurrencyHistoryResponse,
    CurrencyRateEntry,
)
from services.period_utils import period_to_start_date


class CurrencyHistoryService:
    def __init__(
        self,
        currency_repo: CurrencyRepository,
        mid_repo: ExchangeMidRateRepository,
        buy_sell_repo: ExchangeBuySellRateRepository,
    ):
        self.currency_repo = currency_repo
        self.mid_repo = mid_repo
        self.buy_sell_repo = buy_sell_repo

    async def get_currency_history(
        self, code: str, period: str = "1y"
    ) -> CurrencyHistoryResponse | None:
        currency = await self.currency_repo.get_by_code(code)
        if currency is None:
            return None

        start_date = period_to_start_date(period)
        end_date = date.today()

        mid_rates = await self.mid_repo.get_rates_for_period(
            currency.id, start_date, end_date
        )
        buy_sell_rates = await self.buy_sell_repo.get_rates_for_period(
            currency.id, start_date, end_date
        )

        buy_sell_by_date = {rate.effective_date: rate for rate in buy_sell_rates}

        data = []
        for mid_rate in mid_rates:
            bs_rate = buy_sell_by_date.get(mid_rate.effective_date)
            data.append(
                CurrencyRateEntry(
                    time=mid_rate.effective_date,
                    mid=mid_rate.mid,
                    bid=bs_rate.bid if bs_rate else mid_rate.mid,
                    ask=bs_rate.ask if bs_rate else mid_rate.mid,
                )
            )

        return CurrencyHistoryResponse(
            code=currency.code,
            currency=currency.name,
            data=data,
        )
