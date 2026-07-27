from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class StockPriceInfo(BaseModel):
    trading_date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int
    change: Decimal
    change_percent: Decimal


class StockWithPriceResponse(BaseModel):
    symbol: str
    yahoo_symbol: str
    name: str
    stock_exchange: str
    indices: list[str]
    price: StockPriceInfo


class StockOHLCVEntry(BaseModel):
    time: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int


class StockHistoryResponse(BaseModel):
    symbol: str
    name: str
    data: list[StockOHLCVEntry]
