import asyncio
from datetime import date

import pandas as pd
import requests
import yfinance as yf
from yfinance.exceptions import YFRateLimitError


class YahooFinanceClient:
    async def get_history(
        self,
        yahoo_symbol: str,
        start_date: date,
        end_date: date,
    ) -> pd.DataFrame:
        try:
            response = await asyncio.to_thread(
                yf.download,
                yahoo_symbol,
                start=start_date,
                end=end_date,
                progress=False,
            )
            return response
        except YFRateLimitError:
            raise
        except requests.exceptions.ConnectionError as e:
            print(f"Connection error for {yahoo_symbol}: {e}")
            return pd.DataFrame()
        except requests.exceptions.Timeout as e:
            print(f"Timeout for {yahoo_symbol}: {e}")
            return pd.DataFrame()
        except Exception as e:
            print(f"Error downloading {yahoo_symbol}: {e}")
            return pd.DataFrame()

    async def get_history_batch(
        self,
        yahoo_symbols: list[str],
        period: str = "max",
    ) -> pd.DataFrame:
        if not yahoo_symbols:
            return pd.DataFrame()

        try:
            response = await asyncio.to_thread(
                yf.download,
                yahoo_symbols,
                period=period,
                group_by="ticker",
                threads=False,
                progress=False,
            )
            return response
        except YFRateLimitError:
            raise
        except requests.exceptions.ConnectionError as e:
            print(f"Connection error for batch: {e}")
            return pd.DataFrame()
        except requests.exceptions.Timeout as e:
            print(f"Timeout for batch: {e}")
            return pd.DataFrame()
        except Exception as e:
            print(f"Error downloading batch: {e}")
            return pd.DataFrame()

    async def get_last_session(self, yahoo_symbol: str) -> pd.DataFrame:
        try:
            response = await asyncio.to_thread(
                yf.download,
                yahoo_symbol,
                period="1d",
                progress=False,
            )
            return response
        except YFRateLimitError:
            raise
        except requests.exceptions.ConnectionError as e:
            print(f"Connection error for {yahoo_symbol}: {e}")
            return pd.DataFrame()
        except requests.exceptions.Timeout as e:
            print(f"Timeout for {yahoo_symbol}: {e}")
            return pd.DataFrame()
        except Exception as e:
            print(f"Error downloading {yahoo_symbol}: {e}")
            return pd.DataFrame()
