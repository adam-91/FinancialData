from decimal import Decimal
from integrations.NBP.currency_schema import NBP_AB_table, NBP_C_table
from dto.exchange_rate_dto import BuyAndSellRateCreateDTO, MidRateCreateDTO, MidRateDTO, BuyAndSellRateDTO
from db.models.exchange_buy_and_sell_rate import ExchangeBuyAndSellRate
from db.models.exchange_mid_rate import ExchangeMidRate


def parse_nbp_ab_data(data: list) -> NBP_AB_table:
    table = data[0]
    rates = table["rates"]

    if isinstance(rates, dict):
        rates = [rates]

    for rate in rates:
        rate["mid"] = Decimal(str(rate["mid"]))

    return NBP_AB_table(
        table = table["table"],
        no = table["no"],
        effectiveDate = table["effectiveDate"],
        rates = rates
    )

def parse_nbp_c_data(data: list) -> NBP_C_table:
    table = data[0]
    rates = table["rates"]

    if isinstance(rates, dict):
        rates = [rates]

    for rate in rates:
        rate["bid"] = Decimal(str(rate["bid"]))
        rate["ask"] = Decimal(str(rate["ask"]))

    return NBP_C_table(
        table = table["table"],
        no = table["no"],
        tradingDate = table["tradingDate"],
        effectiveDate = table["effectiveDate"],
        rates = rates
    )

def dto_to_entity(dto: MidRateCreateDTO | BuyAndSellRateCreateDTO, currency_id: int,) -> ExchangeMidRate | ExchangeBuyAndSellRate:
    if isinstance(dto, BuyAndSellRateCreateDTO):
        return ExchangeBuyAndSellRate(
            currency_id=currency_id,
            bid=dto.bid,
            ask=dto.ask,
            effective_date=dto.effective_date,
        )
    else:
          return ExchangeMidRate(
            currency_id=currency_id,
            mid=dto.mid,
            effective_date=dto.effective_date,
          )

def map_to_mid_models(table: NBP_AB_table) -> list[MidRateDTO]:
    return [
        MidRateDTO(
            currency=r.currency,
            code=r.code,
            mid=r.mid,
            effective_date=table.effectiveDate,
        )
        for r in table.rates
    ]

def map_to_bas_models(table: NBP_C_table) -> list[BuyAndSellRateDTO]:
    return [
        BuyAndSellRateDTO(
            currency=r.currency,
            code=r.code,
            bid=r.bid,
            ask=r.ask,
            effective_date=table.effectiveDate,
        )
        for r in table.rates
    ]