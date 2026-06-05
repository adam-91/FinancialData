from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class MidRateDTO(BaseModel):
    currency: str
    code: str
    mid: Decimal
    effective_date: date

class BuyAndSellRateDTO(BaseModel):
    currency: str
    code: str
    bid: Decimal
    ask: Decimal
    effective_date: date
