from pandas import DataFrame
from pydantic import BaseModel, Field

from .yfinance_stock_feed import GPW_Indexes


class NBP_currency_mean(BaseModel):
    currency: str
    code: str = Field(length=3)
    mid: float


type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None


def validate(index: GPW_Indexes, data: DataFrame) -> bool:
    return True
