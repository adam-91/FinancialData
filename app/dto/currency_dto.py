from pydantic import BaseModel


class CurrencyCreateDTO(BaseModel):
    id: int
    code: str
    name: str


class CurrencyDTO(BaseModel):
    id: int

    model_config = {"from_attributes": True}
