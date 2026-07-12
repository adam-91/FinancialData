from pydantic import BaseModel


class StockCompanyCreateDTO(BaseModel):
    symbol: str
    yahoo_symbol: str
    name: str
    stock_exchange_id: int
    active: bool


class StockCompanyDTO(StockCompanyCreateDTO):
    id: int

    model_config = {"from_attributes": True}
