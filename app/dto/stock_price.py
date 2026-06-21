from datetime import date
from decimal import Decimal

from app.dto.stock_company import StockCompanyDTO
from pydantic import BaseModel


class StockPriceCreateDTO(BaseModel):
    stock_id: int
    trading_date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    adj_close: Decimal
    volume: Decimal


class StockPriceDTO(StockPriceCreateDTO):
    id: int

    model_config = {"from_attributes": True}

class StockPriceFullDTO(StockPriceDTO):
    stock: StockCompanyDTO

    model_config = {"from_attributes": True}
