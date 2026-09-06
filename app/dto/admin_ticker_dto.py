from pydantic import BaseModel


class TickerCreateDTO(BaseModel):
    symbol: str
    name: str
    exchange_symbol: str
    yahoo_symbol: str | None = None
    auto_fetch: bool = True


class IndexCreateDTO(BaseModel):
    symbol: str
    name: str
    exchange_symbol: str
    auto_fetch: bool = True


class YfinanceTestRequest(BaseModel):
    symbol: str


class YfinanceTestResponse(BaseModel):
    symbol: str
    found: bool
    last_close: float | None = None
    last_date: str | None = None
    error: str | None = None


class ExchangeOptionDTO(BaseModel):
    id: int
    symbol: str
    name: str
    ticker: str | None = None

    model_config = {"from_attributes": True}


class AdminCompanyDTO(BaseModel):
    id: int
    symbol: str
    yahoo_symbol: str
    name: str
    exchange_id: int
    active: bool

    model_config = {"from_attributes": True}
