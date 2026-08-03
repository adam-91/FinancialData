from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class CurrencyRateEntry(BaseModel):
    time: date
    mid: Decimal
    bid: Decimal
    ask: Decimal


class CurrencyHistoryResponse(BaseModel):
    code: str
    currency: str
    data: list[CurrencyRateEntry]
