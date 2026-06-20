from pydantic import BaseModel


class StockCreateDTO(BaseModel):
    symbol: str
    yahoo_symbol: str
    name: str
    exchange: str
    active: bool


class StockDTO(StockCreateDTO):
    id: int

    model_config = {"from_attributes": True}
