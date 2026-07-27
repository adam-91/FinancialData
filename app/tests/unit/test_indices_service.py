from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest

from services.indices_service import IndicesService


@pytest.mark.asyncio
async def test_get_all_indices_returns_list():
    index_repo = SimpleNamespace()
    rate_repo = SimpleNamespace()

    async def get_all_with_exchange():
        return [
            SimpleNamespace(
                id=1,
                symbol="^WIG20",
                name="WIG 20",
                stock_exchange=SimpleNamespace(symbol="GPW"),
                active=True,
            ),
            SimpleNamespace(
                id=2,
                symbol="^GSPC",
                name="S&P 500",
                stock_exchange=SimpleNamespace(symbol="NYSE"),
                active=True,
            ),
        ]

    index_repo.get_all_with_exchange = get_all_with_exchange

    service = IndicesService(index_repo, rate_repo)
    result = await service.get_all_indices()

    assert len(result) == 2
    assert result[0].symbol == "^WIG20"
    assert result[0].stock_exchange == "GPW"
    assert result[1].symbol == "^GSPC"
    assert result[1].stock_exchange == "NYSE"


@pytest.mark.asyncio
async def test_get_index_history_returns_data():
    index_repo = SimpleNamespace()
    rate_repo = SimpleNamespace()

    async def get_all_with_exchange():
        return [
            SimpleNamespace(
                id=1,
                symbol="^WIG20",
                name="WIG 20",
                stock_exchange=SimpleNamespace(symbol="GPW"),
                active=True,
            ),
        ]

    async def get_rates_for_period(index_id, start_date, end_date):
        return [
            SimpleNamespace(
                trading_date=date(2024, 1, 2),
                open=Decimal("2450.12"),
                high=Decimal("2475.89"),
                low=Decimal("2440.50"),
                close=Decimal("2468.33"),
                volume=Decimal("125000000"),
            ),
            SimpleNamespace(
                trading_date=date(2024, 1, 3),
                open=Decimal("2468.33"),
                high=Decimal("2480.15"),
                low=Decimal("2455.20"),
                close=Decimal("2472.45"),
                volume=Decimal("118000000"),
            ),
        ]

    index_repo.get_all_with_exchange = get_all_with_exchange
    rate_repo.get_rates_for_period = get_rates_for_period

    service = IndicesService(index_repo, rate_repo)
    result = await service.get_index_history("^WIG20", "1y")

    assert result is not None
    assert result.symbol == "^WIG20"
    assert result.name == "WIG 20"
    assert len(result.data) == 2
    assert result.data[0].time == date(2024, 1, 2)
    assert result.data[0].open == Decimal("2450.12")
    assert result.data[0].volume == 125000000


@pytest.mark.asyncio
async def test_get_index_history_returns_none_for_unknown_symbol():
    index_repo = SimpleNamespace()
    rate_repo = SimpleNamespace()

    async def get_all_with_exchange():
        return []

    index_repo.get_all_with_exchange = get_all_with_exchange

    service = IndicesService(index_repo, rate_repo)
    result = await service.get_index_history("^UNKNOWN", "1y")

    assert result is None
