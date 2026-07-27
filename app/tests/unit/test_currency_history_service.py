from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest

from services.currency_history_service import CurrencyHistoryService


@pytest.mark.asyncio
async def test_get_currency_history_returns_data():
    currency_repo = SimpleNamespace()
    mid_repo = SimpleNamespace()
    buy_sell_repo = SimpleNamespace()

    async def get_by_code(code):
        return SimpleNamespace(id=1, code="EUR", name="euro")

    async def get_rates_for_period(currency_id, start_date, end_date):
        return [
            SimpleNamespace(
                effective_date=date(2024, 1, 2),
                mid=Decimal("4.3250"),
            ),
            SimpleNamespace(
                effective_date=date(2024, 1, 3),
                mid=Decimal("4.3180"),
            ),
        ]

    async def get_buy_sell_rates_for_period(currency_id, start_date, end_date):
        return [
            SimpleNamespace(
                effective_date=date(2024, 1, 2),
                bid=Decimal("4.3034"),
                ask=Decimal("4.3466"),
            ),
            SimpleNamespace(
                effective_date=date(2024, 1, 3),
                bid=Decimal("4.2964"),
                ask=Decimal("4.3396"),
            ),
        ]

    currency_repo.get_by_code = get_by_code
    mid_repo.get_rates_for_period = get_rates_for_period
    buy_sell_repo.get_rates_for_period = get_buy_sell_rates_for_period

    service = CurrencyHistoryService(currency_repo, mid_repo, buy_sell_repo)
    result = await service.get_currency_history("EUR", "1y")

    assert result is not None
    assert result.code == "EUR"
    assert result.currency == "euro"
    assert len(result.data) == 2
    assert result.data[0].time == date(2024, 1, 2)
    assert result.data[0].mid == Decimal("4.3250")
    assert result.data[0].bid == Decimal("4.3034")
    assert result.data[0].ask == Decimal("4.3466")


@pytest.mark.asyncio
async def test_get_currency_history_returns_none_for_unknown_code():
    currency_repo = SimpleNamespace()
    mid_repo = SimpleNamespace()
    buy_sell_repo = SimpleNamespace()

    async def get_by_code(code):
        return None

    currency_repo.get_by_code = get_by_code

    service = CurrencyHistoryService(currency_repo, mid_repo, buy_sell_repo)
    result = await service.get_currency_history("XYZ", "1y")

    assert result is None


@pytest.mark.asyncio
async def test_merge_mid_and_bid_ask_when_bid_ask_missing():
    currency_repo = SimpleNamespace()
    mid_repo = SimpleNamespace()
    buy_sell_repo = SimpleNamespace()

    async def get_by_code(code):
        return SimpleNamespace(id=1, code="EUR", name="euro")

    async def get_rates_for_period(currency_id, start_date, end_date):
        return [
            SimpleNamespace(
                effective_date=date(2024, 1, 2),
                mid=Decimal("4.3250"),
            ),
        ]

    async def get_buy_sell_rates_for_period(currency_id, start_date, end_date):
        return []

    currency_repo.get_by_code = get_by_code
    mid_repo.get_rates_for_period = get_rates_for_period
    buy_sell_repo.get_rates_for_period = get_buy_sell_rates_for_period

    service = CurrencyHistoryService(currency_repo, mid_repo, buy_sell_repo)
    result = await service.get_currency_history("EUR", "1y")

    assert result is not None
    assert len(result.data) == 1
    assert result.data[0].mid == Decimal("4.3250")
    assert result.data[0].bid == Decimal("4.3250")
    assert result.data[0].ask == Decimal("4.3250")
