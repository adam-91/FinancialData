import logging
from datetime import datetime
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)


class ParquetTracker:
    def __init__(self, parquet_path: str = "data/last_fetch_tracker.parquet"):
        self.parquet_path = Path(parquet_path)
        self.df: pd.DataFrame = pd.DataFrame(
            columns=["yahoo_symbol", "type", "last_fetched_at", "status"]
        )
        self._load()

    def _load(self) -> None:
        if self.parquet_path.exists():
            try:
                self.df = pd.read_parquet(self.parquet_path)
            except Exception as e:
                logger.error("Error loading parquet tracker", error=str(e))
                self.df = pd.DataFrame(
                    columns=["yahoo_symbol", "type", "last_fetched_at", "status"]
                )
        else:
            self.parquet_path.parent.mkdir(parents=True, exist_ok=True)
            self.df = pd.DataFrame(
                columns=["yahoo_symbol", "type", "last_fetched_at", "status"]
            )

    def save(self) -> None:
        try:
            self.parquet_path.parent.mkdir(parents=True, exist_ok=True)
            self.df.to_parquet(self.parquet_path, index=False)
        except Exception as e:
            logger.error("Error saving parquet tracker", error=str(e))

    def is_stale(
        self, yahoo_symbol: str, symbol_type: str, threshold_days: int = 30
    ) -> bool:
        if self.df.empty:
            return True

        mask = (self.df["yahoo_symbol"] == yahoo_symbol) & (
            self.df["type"] == symbol_type
        )
        if not mask.any():
            return True

        row = self.df[mask].iloc[0]
        last_fetched = pd.to_datetime(row["last_fetched_at"])
        now = pd.Timestamp.now()
        days_diff = (now - last_fetched).days

        return days_diff >= threshold_days

    def get_stale_symbols(
        self, symbols: list[str], symbol_type: str, threshold_days: int = 30
    ) -> list[str]:
        stale = []
        for symbol in symbols:
            if self.is_stale(symbol, symbol_type, threshold_days):
                stale.append(symbol)
        return stale

    def update(self, yahoo_symbol: str, symbol_type: str, status: str) -> None:
        now = datetime.now()
        mask = (self.df["yahoo_symbol"] == yahoo_symbol) & (
            self.df["type"] == symbol_type
        )

        if mask.any():
            self.df.loc[mask, "last_fetched_at"] = now
            self.df.loc[mask, "status"] = status
        else:
            new_row = pd.DataFrame(
                [
                    {
                        "yahoo_symbol": yahoo_symbol,
                        "type": symbol_type,
                        "last_fetched_at": now,
                        "status": status,
                    }
                ]
            )
            self.df = pd.concat([self.df, new_row], ignore_index=True)
