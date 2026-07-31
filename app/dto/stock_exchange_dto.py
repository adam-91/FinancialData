from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from dto.stock_company_dto import StockCompanyDTO


class StockExchangeCreateDTO(BaseModel):
    symbol: str
    name: str
    country: str
    active: bool


class StockExchangeDTO(StockExchangeCreateDTO):
    id: int

    model_config = {"from_attributes": True}


class StockExchangeIndexCreateDTO(BaseModel):
    symbol: str
    name: str
    active: bool
    stock_exchange_id: int

class StockExchangeIndexDTO(BaseModel):
    id: int
    symbol: str
    name: str
    active: bool
    stock_exchange_id: int

    model_config = {"from_attributes": True}

class StockExchangeIndexRateCreateDTO(BaseModel):
    index_id: int
    trading_date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    adj_close: Decimal
    volume: Decimal


class StockExchangeIndexRateDTO(StockExchangeIndexRateCreateDTO):
    id: int

    model_config = {"from_attributes": True}

class StockIndexMembershipCreateDTO(BaseModel):
    company_id: int
    index_id: int
    joined_at: date
    left_at: date | None
    active: bool

class StockIndexMembershipDTO(BaseModel):

    joined_at:date
    left_at: date | None
    active: bool
    company: StockCompanyDTO
    index: StockExchangeIndexDTO
    stock_exchange: StockExchangeDTO


