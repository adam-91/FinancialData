from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class IndexResponse(BaseModel):
    id: int
    symbol: str
    name: str
    stock_exchange: str
    active: bool

    model_config = {"from_attributes": True}


class IndexOHLCVEntry(BaseModel):
    time: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int


class IndexHistoryResponse(BaseModel):
    symbol: str
    name: str
    data: list[IndexOHLCVEntry]
