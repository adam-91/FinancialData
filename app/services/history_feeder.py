import asyncio
import random
from collections import defaultdict
from decimal import Decimal, InvalidOperation

import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from yfinance.exceptions import YFRateLimitError

from core.config import settings
from db.database import AsyncSessionFactory
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_exchange import StockExchangeRepository
from db.repositories.stock_exchange_index import StockExchangeIndexRepository
from db.repositories.stock_exchange_index_rate import (
    StockExchangeIndexRateRepository,
)
from db.repositories.stock_price import StockPriceRepository
from integrations.yfinance.client import YahooFinanceClient
from services.parquet_tracker import ParquetTracker


class HistoricalDataFeeder:
    def __init__(
        self,
        session: AsyncSession,
        tracker: ParquetTracker | None = None,
        yf_client: YahooFinanceClient | None = None,
    ):
        self.session = session
        self.company_repo = StockCompanyRepository(session)
        self.stock_price_repo = StockPriceRepository(session)
        self.exchange_repo = StockExchangeRepository(session)
        self.index_repo = StockExchangeIndexRepository(session)
        self.index_rate_repo = StockExchangeIndexRateRepository(session)
        self.yf_client = yf_client or YahooFinanceClient()
        self.tracker = tracker or ParquetTracker()

    async def feed_all(self) -> None:
        print("HistoricalDataFeeder: starting feed_all")

        companies = await self.company_repo.get_all()
        active_companies = [c for c in companies if c.active]

        exchanges = await self.exchange_repo.get_all()
        exchange_map = {e.id: e for e in exchanges}

        companies_by_exchange = defaultdict(list)
        for company in active_companies:
            companies_by_exchange[company.exchange_id].append(company)

        sorted_exchange_ids = sorted(
            companies_by_exchange.keys(),
            key=lambda eid: (
                0 if exchange_map.get(eid) and exchange_map[eid].symbol == "GPW" else 1
            ),
        )

        for exchange_id in sorted_exchange_ids:
            exchange = exchange_map.get(exchange_id)
            if not exchange:
                continue

            exchange_companies = companies_by_exchange[exchange_id]
            yahoo_symbols = [c.yahoo_symbol for c in exchange_companies]
            symbol_to_company_id = {c.yahoo_symbol: c.id for c in exchange_companies}

            print(
                f"HistoricalDataFeeder: processing exchange {exchange.symbol} "
                f"({len(exchange_companies)} companies)"
            )

            await self._feed_companies_batch(yahoo_symbols, symbol_to_company_id)

            await self._feed_exchange_indexes(exchange_id, exchange.symbol)

        self.tracker.save()
        print("HistoricalDataFeeder: feed_all completed")

    async def _feed_companies_batch(
        self,
        yahoo_symbols: list[str],
        symbol_to_company_id: dict[str, int],
    ) -> None:
        stale_symbols = self.tracker.get_stale_symbols(
            yahoo_symbols, "company", settings.HISTORY_FEED_STALE_THRESHOLD_DAYS
        )

        if not stale_symbols:
            print("HistoricalDataFeeder: no stale company symbols to fetch")
            return

        print(
            f"HistoricalDataFeeder: {len(stale_symbols)} stale company symbols to fetch"
        )

        for i in range(0, len(stale_symbols), settings.HISTORY_FEED_BATCH_SIZE):
            batch = stale_symbols[i : i + settings.HISTORY_FEED_BATCH_SIZE]
            await self._download_and_save_companies(batch, symbol_to_company_id)
            delay = random.uniform(
                settings.HISTORY_FEED_SLEEP_MIN, settings.HISTORY_FEED_SLEEP_MAX
            )
            await asyncio.sleep(delay)

    async def _download_and_save_companies(
        self,
        batch: list[str],
        symbol_to_company_id: dict[str, int],
    ) -> None:
        for attempt in range(settings.HISTORY_FEED_RATE_LIMIT_MAX_RETRIES):
            try:
                df = await self.yf_client.get_history_batch(batch, period="max")

                if df.empty:
                    for symbol in batch:
                        self.tracker.update(symbol, "company", "empty")
                    return

                records = self._parse_batch_dataframe(df, batch, symbol_to_company_id)

                if records:
                    try:
                        await self.stock_price_repo.bulk_upsert(records)
                    except Exception as e:
                        await self.session.rollback()
                        print(f"HistoricalDataFeeder: DB error saving companies: {e}")
                        for symbol in batch:
                            self.tracker.update(symbol, "company", "error")
                        return

                for symbol in batch:
                    self.tracker.update(symbol, "company", "success")

                print(
                    f"HistoricalDataFeeder: saved {len(records)} records "
                    f"for batch of {len(batch)} companies"
                )
                return

            except YFRateLimitError:
                delay = settings.HISTORY_FEED_RATE_LIMIT_BASE_DELAY * (2**attempt)
                print(
                    f"HistoricalDataFeeder: YFRateLimitError, "
                    f"retry {attempt + 1}/"
                    f"{settings.HISTORY_FEED_RATE_LIMIT_MAX_RETRIES}, "
                    f"waiting {delay}s"
                )
                await asyncio.sleep(delay)

        for symbol in batch:
            self.tracker.update(symbol, "company", "rate_limited")
        print(
            f"HistoricalDataFeeder: batch failed after "
            f"{settings.HISTORY_FEED_RATE_LIMIT_MAX_RETRIES} retries"
        )

    def _parse_batch_dataframe(
        self,
        df: pd.DataFrame,
        tickers: list[str],
        symbol_to_company_id: dict[str, int],
    ) -> list[dict]:
        records: list[dict] = []

        if len(tickers) == 1:
            records.extend(
                self._parse_single_ticker_df(df, tickers[0], symbol_to_company_id)
            )
            return records

        for ticker in tickers:
            if ticker not in symbol_to_company_id:
                continue

            try:
                ticker_df = (
                    df[ticker] if ticker in df.columns.get_level_values(0) else None
                )
                if ticker_df is None:
                    continue
                ticker_df = ticker_df.dropna(how="all")

                if ticker_df.empty:
                    continue

                company_id = symbol_to_company_id[ticker]

                for date_idx, row in ticker_df.iterrows():
                    trading_date = pd.Timestamp(date_idx).date()
                    record = self._row_to_record(row, company_id, trading_date)
                    if record:
                        records.append(record)
            except Exception as e:
                print(f"HistoricalDataFeeder: error parsing {ticker}: {e}")
                continue

        return records

    def _parse_single_ticker_df(
        self,
        df: pd.DataFrame,
        ticker: str,
        symbol_to_company_id: dict[str, int],
    ) -> list[dict]:
        records = []

        if ticker not in symbol_to_company_id:
            return records

        company_id = symbol_to_company_id[ticker]
        df = df.dropna(how="all")

        for date_idx, row in df.iterrows():
            trading_date = pd.Timestamp(date_idx).date()
            record = self._row_to_record(row, company_id, trading_date)
            if record:
                records.append(record)

        return records

    @staticmethod
    def _row_to_record(row: pd.Series, company_id: int, trading_date) -> dict | None:
        try:
            open_val = HistoricalDataFeeder._to_decimal(row.get("Open"))
            high_val = HistoricalDataFeeder._to_decimal(row.get("High"))
            low_val = HistoricalDataFeeder._to_decimal(row.get("Low"))
            close_val = HistoricalDataFeeder._to_decimal(row.get("Close"))
            adj_close_val = HistoricalDataFeeder._to_decimal(
                row.get("Adj Close", row.get("Adj_Close"))
            )
            volume_val = HistoricalDataFeeder._to_decimal(row.get("Volume"))

            if any(
                v is None
                for v in [
                    open_val,
                    high_val,
                    low_val,
                    close_val,
                    adj_close_val,
                    volume_val,
                ]
            ):
                return None

            return {
                "company_id": company_id,
                "trading_date": trading_date,
                "open": open_val,
                "high": high_val,
                "low": low_val,
                "close": close_val,
                "adj_close": adj_close_val,
                "volume": volume_val,
            }
        except Exception:
            return None

    @staticmethod
    def _to_decimal(value) -> Decimal | None:
        if value is None or pd.isna(value):
            return None
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError):
            return None

    async def _feed_exchange_indexes(
        self, exchange_id: int, exchange_symbol: str
    ) -> None:
        indexes = await self.index_repo.get_exchange_indexes(exchange_id)
        if not indexes:
            print(f"HistoricalDataFeeder: no indexes for exchange {exchange_symbol}")
            return

        index_symbols = [idx.symbol for idx in indexes]
        symbol_to_index_id = {idx.symbol: idx.id for idx in indexes}

        stale_index_symbols = self.tracker.get_stale_symbols(
            index_symbols, "index", settings.HISTORY_FEED_STALE_THRESHOLD_DAYS
        )

        if not stale_index_symbols:
            print(f"HistoricalDataFeeder: no stale index symbols for {exchange_symbol}")
            return

        print(
            f"HistoricalDataFeeder: {len(stale_index_symbols)} stale index symbols "
            f"for {exchange_symbol}"
        )

        for i in range(0, len(stale_index_symbols), settings.HISTORY_FEED_BATCH_SIZE):
            batch = stale_index_symbols[i : i + settings.HISTORY_FEED_BATCH_SIZE]
            await self._download_and_save_indexes(batch, symbol_to_index_id)
            delay = random.uniform(
                settings.HISTORY_FEED_SLEEP_MIN, settings.HISTORY_FEED_SLEEP_MAX
            )
            await asyncio.sleep(delay)

    async def _download_and_save_indexes(
        self,
        batch: list[str],
        symbol_to_index_id: dict[str, int],
    ) -> None:
        for attempt in range(settings.HISTORY_FEED_RATE_LIMIT_MAX_RETRIES):
            try:
                df = await self.yf_client.get_history_batch(batch, period="max")

                if df.empty:
                    for symbol in batch:
                        self.tracker.update(symbol, "index", "empty")
                    return

                records = self._parse_index_batch_dataframe(
                    df, batch, symbol_to_index_id
                )

                if records:
                    try:
                        await self.index_rate_repo.bulk_upsert(records)
                    except Exception as e:
                        await self.session.rollback()
                        print(f"HistoricalDataFeeder: DB error saving indexes: {e}")
                        for symbol in batch:
                            self.tracker.update(symbol, "index", "error")
                        return

                for symbol in batch:
                    self.tracker.update(symbol, "index", "success")

                print(
                    f"HistoricalDataFeeder: saved {len(records)} index rate records "
                    f"for batch of {len(batch)} indexes"
                )
                return

            except YFRateLimitError:
                delay = settings.HISTORY_FEED_RATE_LIMIT_BASE_DELAY * (2**attempt)
                print(
                    f"HistoricalDataFeeder: YFRateLimitError for indexes, "
                    f"retry {attempt + 1}/"
                    f"{settings.HISTORY_FEED_RATE_LIMIT_MAX_RETRIES}, "
                    f"waiting {delay}s"
                )
                await asyncio.sleep(delay)

        for symbol in batch:
            self.tracker.update(symbol, "index", "rate_limited")
        print(
            f"HistoricalDataFeeder: index batch failed after "
            f"{settings.HISTORY_FEED_RATE_LIMIT_MAX_RETRIES} retries"
        )

    def _parse_index_batch_dataframe(
        self,
        df: pd.DataFrame,
        tickers: list[str],
        symbol_to_index_id: dict[str, int],
    ) -> list[dict]:
        records: list[dict] = []

        if len(tickers) == 1:
            records.extend(
                self._parse_single_index_df(df, tickers[0], symbol_to_index_id)
            )
            return records

        for ticker in tickers:
            if ticker not in symbol_to_index_id:
                continue

            try:
                ticker_df = (
                    df[ticker] if ticker in df.columns.get_level_values(0) else None
                )
                if ticker_df is None:
                    continue
                ticker_df = ticker_df.dropna(how="all")

                if ticker_df.empty:
                    continue

                index_id = symbol_to_index_id[ticker]

                for date_idx, row in ticker_df.iterrows():
                    trading_date = pd.Timestamp(date_idx).date()
                    record = self._row_to_index_record(row, index_id, trading_date)
                    if record:
                        records.append(record)
            except Exception as e:
                print(f"HistoricalDataFeeder: error parsing index {ticker}: {e}")
                continue

        return records

    def _parse_single_index_df(
        self,
        df: pd.DataFrame,
        ticker: str,
        symbol_to_index_id: dict[str, int],
    ) -> list[dict]:
        records = []

        if ticker not in symbol_to_index_id:
            return records

        index_id = symbol_to_index_id[ticker]
        df = df.dropna(how="all")

        for date_idx, row in df.iterrows():
            trading_date = pd.Timestamp(date_idx).date()
            record = self._row_to_index_record(row, index_id, trading_date)
            if record:
                records.append(record)

        return records

    @staticmethod
    def _row_to_index_record(
        row: pd.Series, index_id: int, trading_date
    ) -> dict | None:
        try:
            open_val = HistoricalDataFeeder._to_decimal(row.get("Open"))
            high_val = HistoricalDataFeeder._to_decimal(row.get("High"))
            low_val = HistoricalDataFeeder._to_decimal(row.get("Low"))
            close_val = HistoricalDataFeeder._to_decimal(row.get("Close"))
            adj_close_val = HistoricalDataFeeder._to_decimal(
                row.get("Adj Close", row.get("Adj_Close"))
            )
            volume_val = HistoricalDataFeeder._to_decimal(row.get("Volume"))

            if any(
                v is None
                for v in [
                    open_val,
                    high_val,
                    low_val,
                    close_val,
                    adj_close_val,
                    volume_val,
                ]
            ):
                return None

            return {
                "index_id": index_id,
                "trading_date": trading_date,
                "open": open_val,
                "high": high_val,
                "low": low_val,
                "close": close_val,
                "adj_close": adj_close_val,
                "volume": volume_val,
            }
        except Exception:
            return None


async def run_historical_feed() -> None:
    async with AsyncSessionFactory() as session:
        feeder = HistoricalDataFeeder(session)
        await feeder.feed_all()
