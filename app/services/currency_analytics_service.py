from datetime import date, timedelta

import pandas as pd

from db.models.currency import Currency
from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from dto.currency_analytics import (
    CorrelationResponse,
    DailyChangePoint,
    DailyChangeSeries,
    MovingAveragePoint,
    MovingAverageSeries,
    TrendInfo,
)

DAILY_CHANGE_DAYS = 30
LOOKBACK_DAYS = 365


class CurrencyAnalyticsService:
    def __init__(
        self,
        currency_repo: CurrencyRepository,
        mid_repo: ExchangeMidRateRepository,
        buy_sell_repo: ExchangeBuySellRateRepository,
    ):
        self.currency_repo = currency_repo
        self.mid_repo = mid_repo
        self.buy_sell_repo = buy_sell_repo

    async def _get_mid_frame(
        self, code: str, start_date: date
    ) -> tuple[Currency | None, pd.DataFrame | None]:
        currency = await self.currency_repo.get_by_code(code)
        if currency is None:
            return None, None

        rates = await self.mid_repo.get_rates_for_period(
            currency.id, start_date, date.today()
        )
        df = pd.DataFrame(
            [{"date": r.effective_date, "mid": float(r.mid)} for r in rates],
            columns=["date", "mid"],
        )
        if df.empty:
            return currency, df

        df = (
            df.sort_values("date")
            .drop_duplicates(subset=["date"])
            .reset_index(drop=True)
        )
        return currency, df

    async def get_daily_change(self, codes: list[str]) -> list[DailyChangeSeries]:
        start_date = date.today() - timedelta(days=DAILY_CHANGE_DAYS * 2 + 10)
        result: list[DailyChangeSeries] = []

        for code in codes:
            currency, df = await self._get_mid_frame(code, start_date)
            if currency is None:
                continue
            if df is None or df.empty or len(df) < 2:
                result.append(DailyChangeSeries(code=code, currency=code, data=[]))
                continue

            df["change"] = df["mid"].pct_change() * 100
            df = df.dropna(subset=["change"]).tail(DAILY_CHANGE_DAYS)

            data = [
                DailyChangePoint(date=row.date, change=round(float(row.change), 4))
                for row in df.itertuples()
            ]
            result.append(
                DailyChangeSeries(code=code, currency=currency.name, data=data)
            )

        return result

    async def get_moving_average(
        self, codes: list[str], window: int
    ) -> list[MovingAverageSeries]:
        start_date = date.today() - timedelta(days=LOOKBACK_DAYS)
        result: list[MovingAverageSeries] = []

        for code in codes:
            currency, df = await self._get_mid_frame(code, start_date)
            if currency is None:
                continue
            if df is None or df.empty:
                result.append(
                    MovingAverageSeries(
                        code=code,
                        currency=code,
                        data=[],
                        trend=TrendInfo(direction="flat", percent=0.0),
                    )
                )
                continue

            df["ma"] = df["mid"].rolling(window).mean()

            data = [
                MovingAveragePoint(
                    date=row.date,
                    value=round(float(row.mid), 6),
                    ma=None if pd.isna(row.ma) else round(float(row.ma), 6),
                )
                for row in df.itertuples()
            ]

            trend = TrendInfo(direction="flat", percent=0.0)
            ma_series = df["ma"].dropna()
            if len(ma_series) >= 2:
                pct = (
                    (float(ma_series.iloc[-1]) - float(ma_series.iloc[0]))
                    / float(ma_series.iloc[0])
                    * 100
                )
                if pct > 0.05:
                    direction = "up"
                elif pct < -0.05:
                    direction = "down"
                else:
                    direction = "flat"
                trend = TrendInfo(direction=direction, percent=round(pct, 4))

            result.append(
                MovingAverageSeries(
                    code=code,
                    currency=currency.name,
                    data=data,
                    trend=trend,
                )
            )

        return result

    async def get_correlation(self, codes: list[str]) -> CorrelationResponse:
        effective = list(codes)
        if len(effective) == 1:
            reference = "USD" if effective[0] == "EUR" else "EUR"
            if reference not in effective:
                effective.append(reference)

        start_date = date.today() - timedelta(days=LOOKBACK_DAYS)
        returns: dict[str, pd.Series] = {}
        for code in effective:
            _, df = await self._get_mid_frame(code, start_date)
            if df is None or df.empty:
                continue
            returns[code] = df.set_index("date")["mid"].pct_change().rename(code)

        if len(returns) < 2:
            return CorrelationResponse(codes=[], values=[])

        returns_df = pd.DataFrame(returns).dropna()
        if returns_df.empty:
            return CorrelationResponse(codes=list(returns.keys()), values=[])

        corr = returns_df.corr()
        codes_list = [str(c) for c in corr.columns]
        values = [[round(float(v), 4) for v in row] for row in corr.values.tolist()]
        return CorrelationResponse(codes=codes_list, values=values)
