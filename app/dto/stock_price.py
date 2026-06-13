from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class StockPriceDTO(BaseModel):
    ymbol: str
    yahoo_symbol: str
    name: str
    exchange: str
    trading_date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    adj_close: Decimal
    volume: Decimal