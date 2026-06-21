from pydantic import BaseModel


class StockCompanyCreateDTO(BaseModel):
    symbol: str
    yahoo_symbol: str
    name: str
    exchange: str
    active: bool


class StockCompanyDTO(StockCompanyCreateDTO):
    id: int

    model_config = {"from_attributes": True}
