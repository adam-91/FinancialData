import structlog
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, StringConstraints, ValidationError

logger = structlog.get_logger()


class CurrencyResponse(BaseModel):
    id: int
    code: str
    name: str

    model_config = {"from_attributes": True}


# table A - average currency rates
# table A - less often changes - average currency rates
# table C - buy and sell currency rates

type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None


class ExchangeResponse(BaseModel):
    code: str
    currency: str
    effectiveDate: date
    mid: Decimal | None
    bid: Decimal | None
    ask: Decimal | None


class ExchangeResponseAB(BaseModel):
    code: str
    currency: str
    effectiveDate: date
    mid: Decimal | None


class ExchangeResponseC(BaseModel):
    code: str
    currency: str
    effectiveDate: date
    bid: Decimal
    ask: Decimal


class NBP_currency_mean(BaseModel):
    currency: str
    code: str = StringConstraints(min_length=3, max_length=3)
    mid: Decimal


class NBP_currency_buy_and_Sell(BaseModel):
    currency: str
    code: str = StringConstraints(min_length=3, max_length=3)
    bid: Decimal
    ask: Decimal


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


def validate(table: str, data: JSON) -> JSON | bool:
    if table == "NBP_API_TABLE_A":
        logger.info("Validating NBP table A")
        return validate_table_AB(data)
    elif table == "NBP_API_TABLE_B":
        logger.info("Validating NBP table B")
        return validate_table_AB(data)
    else:
        logger.info("Validating NBP table C")
        return validate_table_C(data)


def validate_table_AB(data: list) -> JSON | bool:
    try:
        table = NBP_AB_table.model_validate(data[0])
        logger.info("Validation success for table A/B")
        return table

    except ValidationError as err:
        logger.error("Validation failed for table A/B", error=str(err))
        return False


def validate_table_C(data: list) -> JSON | bool:
    try:
        c_table = NBP_C_table.model_validate(data[0])
        logger.info("Validation success for table C")
        return c_table

    except ValidationError as err:
        logger.error("Validation failed for table C", error=str(err))
        return False
