import asyncio
import structlog
from datetime import date

import pandas as pd
import requests
import yfinance as yf
from yfinance.exceptions import YFRateLimitError

logger = structlog.get_logger()


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
            logger.error("Connection error", symbol=yahoo_symbol, error=str(e))
            return pd.DataFrame()
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error", symbol=yahoo_symbol, error=str(e))
            return pd.DataFrame()
        except Exception as e:
            logger.error("Error downloading symbol", symbol=yahoo_symbol, error=str(e))
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
            logger.error("Connection error for batch", error=str(e))
            return pd.DataFrame()
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error for batch", error=str(e))
            return pd.DataFrame()
        except Exception as e:
            logger.error("Error downloading batch", error=str(e))
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
            logger.error("Connection error", symbol=yahoo_symbol, error=str(e))
            return pd.DataFrame()
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error", symbol=yahoo_symbol, error=str(e))
            return pd.DataFrame()
        except Exception as e:
            logger.error("Error downloading symbol", symbol=yahoo_symbol, error=str(e))
            return pd.DataFrame()
