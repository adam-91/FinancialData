#import pandas as pd
from typing import TypeAlias
from pydantic import BaseModel, Field, ValidationError
from datetime import date

#table A - average currency rates
#table A - less often changes - average currency rates 
#table C - buy and sell currency rates

class NBP_currency_mean(BaseModel):
    currency: str
    code: str = Field(length=3)
    mid: float

class NBP_currency_buy_and_Sell(BaseModel):
    currency: str
    code: str = Field(length=3)
    bid: float
    ask: float

class NBP_AB_table(BaseModel):
    table: str
    no: str
    effectiveDate: date
    rates: list[NBP_currency_mean]

class NBP_C_table(BaseModel):
    table: str
    no: str
    tradingDate: date
    effectiveDate: date
    rates: list[NBP_currency_buy_and_Sell]

JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

def validate(table: str, data: JSON) -> JSON | bool:
    if table == "NBP_API_TABLE_A":
        print('validate table A')
        return validate_table_AB(data)
    elif table == "NBP_API_TABLE_B":
        print('validate table B')
        return validate_table_AB(data)
    else:
        print('validate table C')
        return validate_table_C(data)

def validate_table_AB(data: list) -> JSON | bool:
    try:
        table = NBP_AB_table.model_validate(data[0])
        print('validation success')
        return table

    except ValidationError as err:
        print(f'Validation failed: {err}')
        return False


def validate_table_C(data: list) -> JSON | bool:
    try:
        c_table = NBP_C_table.model_validate(data[0])
        print('validation success C table')
        return c_table

    except ValidationError as err:
        print(f'Validation failed: {err}')
        return False
    
