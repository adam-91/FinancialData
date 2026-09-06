from decimal import Decimal

from pydantic import BaseModel


class CurrencySummaryItem(BaseModel):
    code: str
    currency: str
    mid: Decimal | None
    bid: Decimal | None
    ask: Decimal | None
    change: float | None
