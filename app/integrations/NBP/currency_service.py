from decimal import Decimal
from integrations.NBP.currency_schema import NBP_AB_table, NBP_C_table
from db.models.exchange_buy_and_sell_rate import ExchangeBuyAndSellRate
from db.models.exchange_mid_rate import ExchangeMidRate


def parse_nbp_ab_data(data: list) -> NBP_AB_table:
    table = data[0]

    for rate in table["rates"]:
        rate["mid"] = Decimal(str(rate["mid"]))

    return NBP_AB_table(**{
        "effectiveDate": table["effectiveDate"],
        "rates": table["rates"]
    })

def parse_nbp_c_data(data: list) -> NBP_C_table:
    table = data[0]

    for rate in table["rates"]:
        rate["bid"] = Decimal(str(rate["bid"]))
        rate["ask"] = Decimal(str(rate["ask"]))

    return NBP_C_table(**{
        "effectiveDate": table["effectiveDate"],
        "rates": table["rates"]
    })


def map_to_mid_models(table: ExchangeMidRate) -> list[ExchangeMidRate]:
    return [
        ExchangeMidRate(
            currency=r.currency,
            code=r.code,
            mid=r.mid,  
            effective_date=table['effectiveDate']
        )
        for r in table.rates
    ]

def map_to_bas_models(table: ExchangeBuyAndSellRate) -> list[ExchangeBuyAndSellRate]:
    return [
        ExchangeBuyAndSellRate(
            currency=r.currency,
            code=r.code,
            bid=r.bid,  
            ask=r.ask,  
            effective_date=table['effectiveDate']
        )
        for r in table.rates
    ]