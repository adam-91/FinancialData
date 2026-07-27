from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest

from services.stock_prices_service import StockPricesService


@pytest.mark.asyncio
async def test_get_all_prices_returns_list():
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    async def get_all_latest_prices():
        company1 = SimpleNamespace(
            id=1,
            symbol="CDR",
            yahoo_symbol="CDR.WA",
            name="CD Projekt",
            stock_exchange=SimpleNamespace(symbol="GPW"),
            stock_index_memberships=[
                SimpleNamespace(
                    active=True,
                    stock_index=SimpleNamespace(symbol="^WIG20"),
                ),
                SimpleNamespace(
                    active=True,
                    stock_index=SimpleNamespace(symbol="^WIG"),
                ),
            ],
        )
        price1 = SimpleNamespace(
            trading_date=date(2024, 1, 15),
            open=Decimal("185.50"),
            high=Decimal("188.90"),
            low=Decimal("184.20"),
            close=Decimal("187.30"),
            volume=Decimal("2500000"),
        )
        return [(company1, price1)]

    price_repo.get_all_latest_prices = get_all_latest_prices

    service = StockPricesService(company_repo, price_repo)
    result = await service.get_all_prices()

    assert len(result) == 1
    assert result[0].symbol == "CDR"
    assert result[0].yahoo_symbol == "CDR.WA"
    assert result[0].name == "CD Projekt"
    assert result[0].stock_exchange == "GPW"
    assert "^WIG20" in result[0].indices
    assert "^WIG" in result[0].indices
    assert result[0].price.trading_date == date(2024, 1, 15)
    assert result[0].price.close == Decimal("187.30")


@pytest.mark.asyncio
async def test_change_calculation():
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    async def get_all_latest_prices():
        company = SimpleNamespace(
            id=1,
            symbol="PKN",
            yahoo_symbol="PKN.WA",
            name="PKN Orlen",
            stock_exchange=SimpleNamespace(symbol="GPW"),
            stock_index_memberships=[],
        )
        price = SimpleNamespace(
            trading_date=date(2024, 1, 15),
            open=Decimal("100.00"),
            high=Decimal("105.00"),
            low=Decimal("99.00"),
            close=Decimal("102.00"),
            volume=Decimal("1000000"),
        )
        return [(company, price)]

    price_repo.get_all_latest_prices = get_all_latest_prices

    service = StockPricesService(company_repo, price_repo)
    result = await service.get_all_prices()

    assert result[0].price.change == Decimal("2.00")
    assert result[0].price.change_percent == Decimal("2.00")


@pytest.mark.asyncio
async def test_get_stock_history_returns_data():
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    async def get_all():
        return [
            SimpleNamespace(
                id=1,
                symbol="CDR",
                yahoo_symbol="CDR.WA",
                name="CD Projekt",
            ),
        ]

    async def get_prices_for_period(company_id, start_date, end_date):
        return [
            SimpleNamespace(
                trading_date=date(2024, 1, 2),
                open=Decimal("180.00"),
                high=Decimal("185.50"),
                low=Decimal("178.30"),
                close=Decimal("184.20"),
                volume=Decimal("2800000"),
            ),
        ]

    company_repo.get_all = get_all
    price_repo.get_prices_for_period = get_prices_for_period

    service = StockPricesService(company_repo, price_repo)
    result = await service.get_stock_history("CDR", "1y")

    assert result is not None
    assert result.symbol == "CDR"
    assert result.name == "CD Projekt"
    assert len(result.data) == 1
    assert result.data[0].time == date(2024, 1, 2)
    assert result.data[0].open == Decimal("180.00")


@pytest.mark.asyncio
async def test_get_stock_history_returns_none_for_unknown_symbol():
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    async def get_all():
        return []

    company_repo.get_all = get_all

    service = StockPricesService(company_repo, price_repo)
    result = await service.get_stock_history("UNKNOWN", "1y")

    assert result is None
