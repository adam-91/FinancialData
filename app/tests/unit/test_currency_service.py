from decimal import Decimal
from integrations.NBP.currency_service import (parse_nbp_ab_data, parse_nbp_c_data)


def test_parse_nbp_ab_data_converts_mid_to_decimal():
    payload = [
        {   
            "table":"A",
            "no":"105/A/NBP/2026",
            "effectiveDate":"2026-06-02",
            "rates": [
                {
                    "currency": "dolar amerykański",
                    "code": "USD",
                    "mid": 4.1234,
                },
            ]
        }
    ]

    result = parse_nbp_ab_data(payload)

    assert result.rates[0].mid == Decimal("4.1234")


def test_parse_nbp_c_data_converts_bid_and_ask_to_decimal():
    payload = [
        { 
            "table":"A",
            "no": "105/A/NBP/2026",
            "tradingDate": "2026-06-02",
            "effectiveDate": "2025-01-01",
            "rates": [
                {
                    "currency": "dolar amerykański",
                    "code": "USD",
                    "bid": 3.6013,
                    "ask": 3.6741,
                },
            ]    
        }
    ]

    result = parse_nbp_c_data(payload)

    assert result.rates[0].bid == Decimal("3.6013")
    assert result.rates[0].ask == Decimal("3.6741")