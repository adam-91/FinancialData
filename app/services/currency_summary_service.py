import math
from decimal import Decimal

import pandas as pd

from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from dto.currency_summary import CurrencySummaryItem


def _to_decimal(value: float | None) -> Decimal | None:
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    return Decimal(str(value))


def _round_change(value: float | None) -> float | None:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    return round(float(value), 4)


class CurrencySummaryService:
    def __init__(
        self,
        currency_repo: CurrencyRepository,
        mid_repo: ExchangeMidRateRepository,
        buy_sell_repo: ExchangeBuySellRateRepository,
    ):
        self.currency_repo = currency_repo
        self.mid_repo = mid_repo
        self.buy_sell_repo = buy_sell_repo

    async def get_summary(self) -> list[CurrencySummaryItem]:
        currencies = await self.currency_repo.get_all()
        mid_rows = await self.mid_repo.get_all_with_currency()
        bs_rows = await self.buy_sell_repo.get_all_with_currency()

        mid_df = pd.DataFrame(
            [
                {
                    "code": row.currency.code,
                    "date": row.effective_date,
                    "mid": float(row.mid),
                }
                for row in mid_rows
            ],
            columns=["code", "date", "mid"],
        )

        bs_df = pd.DataFrame(
            [
                {
                    "code": row.currency.code,
                    "date": row.effective_date,
                    "bid": float(row.bid),
                    "ask": float(row.ask),
                }
                for row in bs_rows
            ],
            columns=["code", "date", "bid", "ask"],
        )

        rate_parts = []
        if not mid_df.empty:
            rate_parts.append(
                mid_df.assign(priority=1, rate=mid_df["mid"])[
                    ["code", "date", "rate", "priority"]
                ]
            )
        if not bs_df.empty:
            bs_avg = bs_df.assign(avg=(bs_df["bid"] + bs_df["ask"]) / 2)
            rate_parts.append(
                bs_avg.assign(priority=2, rate=bs_avg["avg"])[
                    ["code", "date", "rate", "priority"]
                ]
            )

        change_by_code: dict[str, float | None] = {}
        if rate_parts:
            combined = pd.concat(rate_parts, ignore_index=True)
            combined = combined.sort_values("priority").drop_duplicates(
                subset=["code", "date"], keep="first"
            )
            combined = combined.sort_values("date")
            combined["change"] = combined.groupby("code")["rate"].pct_change() * 100
            latest = combined.sort_values("date").groupby("code").last()
            for code, row in latest.iterrows():
                change_by_code[str(code)] = _round_change(row["change"])

        mid_by_code: dict[str, float] = {}
        if not mid_df.empty:
            mid_by_code = (
                mid_df.sort_values("date").groupby("code")["mid"].last().to_dict()
            )

        bid_by_code: dict[str, float] = {}
        ask_by_code: dict[str, float] = {}
        if not bs_df.empty:
            bs_latest = bs_df.sort_values("date").groupby("code").last()
            bid_by_code = bs_latest["bid"].to_dict()
            ask_by_code = bs_latest["ask"].to_dict()

        result: list[CurrencySummaryItem] = []
        for currency in currencies:
            code = currency.code
            result.append(
                CurrencySummaryItem(
                    code=code,
                    currency=currency.name,
                    mid=_to_decimal(mid_by_code.get(code)),
                    bid=_to_decimal(bid_by_code.get(code)),
                    ask=_to_decimal(ask_by_code.get(code)),
                    change=change_by_code.get(code),
                )
            )

        return result
