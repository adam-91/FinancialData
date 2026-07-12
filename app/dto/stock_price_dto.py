from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from dto.stock_company_dto import StockCompanyDTO


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
