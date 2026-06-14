from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class MidRateCreateDTO(BaseModel):
    currency: str
    code: str
    mid: Decimal
    effective_date: date

class BuyAndSellRateCreateDTO(BaseModel):
    currency: str
    code: str
    bid: Decimal
    ask: Decimal
    effective_date: date

class MidRateDTO(MidRateCreateDTO):
    id: int

    model_config = {
        "from_attributes": True
    }

class BuyAndSellRateDTO(BuyAndSellRateCreateDTO):
    id: int

    model_config = {
        "from_attributes": True
    }
