from datetime import date
from decimal import Decimal
from types import SimpleNamespace

from dto.exchange_rate_dto import BuyAndSellRateCreateDTO, MidRateCreateDTO
from integrations.NBP.currency_schema import NBP_currency_buy_and_Sell
from integrations.NBP.currency_service import dto_to_entity


def test_map_to_mid_models():
    dto = MidRateCreateDTO(
        currency="US Dollar",
        code="USD",
        mid=Decimal("4.1011"),
        effective_date=date(2025, 1, 1),
    )
    result = dto_to_entity(dto,currency_id=1)

    assert result.currency_id == 1
    assert result.mid == Decimal("4.1011")
    assert str(result.effective_date) == "2025-01-01"


def test_map_to_bas_models():
    dto = BuyAndSellRateCreateDTO(
          currency="dolar amerykański",
        code="USD",
        bid=Decimal("4.10"),
        ask=Decimal("4.20"),
        effective_date=date(2025, 1, 1),
    )

    result = dto_to_entity(dto,currency_id=1)

    assert result.currency_id == 1
    assert result.bid == Decimal("4.10")
    assert result.ask == Decimal("4.20")
    assert result.effective_date == date(2025, 1, 1) 