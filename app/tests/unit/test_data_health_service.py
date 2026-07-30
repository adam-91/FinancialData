from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest

from services.data_health_service import DataHealthService


@pytest.mark.asyncio
async def test_get_summary_calculates_percentages():
    index_repo = SimpleNamespace()
    index_rate_repo = SimpleNamespace()
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    async def get_all_indexes_data_summary():
        return [
            {"id": 1, "symbol": "^WIG20", "name": "WIG 20", "count": 100},
            {"id": 2, "symbol": "^GSPC", "name": "S&P 500", "count": 200},
            {"id": 3, "symbol": "^DJI", "name": "Dow Jones", "count": 0},
        ]

    async def get_all_companies_data_summary():
        return [
            {"id": 1, "symbol": "CDR", "name": "CD Projekt", "count": 50},
            {"id": 2, "symbol": "PKN", "name": "PKN Orlen", "count": 75},
            {"id": 3, "symbol": "KGH", "name": "KGHM", "count": 0},
            {"id": 4, "symbol": "ALE", "name": "Allegro", "count": 30},
        ]

    index_rate_repo.get_all_indexes_data_summary = get_all_indexes_data_summary
    price_repo.get_all_companies_data_summary = get_all_companies_data_summary

    service = DataHealthService(index_repo, index_rate_repo, company_repo, price_repo)
    result = await service.get_summary()

    assert result.total_indices == 3
    assert result.indices_with_data == 2
    assert result.indices_percent == 66.67
    assert result.total_companies == 4
    assert result.companies_with_data == 3
    assert result.companies_percent == 75.0


@pytest.mark.asyncio
async def test_get_index_detail_returns_range():
    index_repo = SimpleNamespace()
    index_rate_repo = SimpleNamespace()
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

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

    async def get_data_range_by_index(index_id):
        return {
            "min_date": date(2020, 1, 2),
            "max_date": date(2024, 1, 15),
            "count": 1000,
        }

    index_repo.get_all_with_exchange = get_all_with_exchange
    index_rate_repo.get_data_range_by_index = get_data_range_by_index

    service = DataHealthService(index_repo, index_rate_repo, company_repo, price_repo)
    result = await service.get_index_detail("^WIG20")

    assert result is not None
    assert result.symbol == "^WIG20"
    assert result.name == "WIG 20"
    assert result.min_date == date(2020, 1, 2)
    assert result.max_date == date(2024, 1, 15)
    assert result.record_count == 1000


@pytest.mark.asyncio
async def test_get_company_detail_returns_range():
    index_repo = SimpleNamespace()
    index_rate_repo = SimpleNamespace()
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

    async def get_data_range_by_company(company_id):
        return {
            "min_date": date(2021, 3, 1),
            "max_date": date(2024, 1, 15),
            "count": 750,
        }

    company_repo.get_all = get_all
    price_repo.get_data_range_by_company = get_data_range_by_company

    service = DataHealthService(index_repo, index_rate_repo, company_repo, price_repo)
    result = await service.get_company_detail("CDR")

    assert result is not None
    assert result.symbol == "CDR"
    assert result.name == "CD Projekt"
    assert result.min_date == date(2021, 3, 1)
    assert result.max_date == date(2024, 1, 15)
    assert result.record_count == 750


@pytest.mark.asyncio
async def test_get_raw_data_with_pagination():
    index_repo = SimpleNamespace()
    index_rate_repo = SimpleNamespace()
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

    async def get_prices_paginated(company_id, page, page_size):
        prices = [
            SimpleNamespace(
                trading_date=date(2024, 1, 15),
                open=Decimal("185.50"),
                high=Decimal("188.90"),
                low=Decimal("184.20"),
                close=Decimal("187.30"),
                volume=Decimal("2500000"),
            ),
            SimpleNamespace(
                trading_date=date(2024, 1, 14),
                open=Decimal("183.00"),
                high=Decimal("186.00"),
                low=Decimal("182.50"),
                close=Decimal("185.50"),
                volume=Decimal("2300000"),
            ),
        ]
        return prices, 750

    company_repo.get_all = get_all
    price_repo.get_prices_paginated = get_prices_paginated

    service = DataHealthService(index_repo, index_rate_repo, company_repo, price_repo)
    result = await service.get_raw_data("company", "CDR", page=1, page_size=50)

    assert result is not None
    assert result.symbol == "CDR"
    assert result.name == "CD Projekt"
    assert result.total == 750
    assert result.page == 1
    assert result.page_size == 50
    assert len(result.data) == 2
    assert result.data[0].trading_date == date(2024, 1, 15)
    assert result.data[0].close == Decimal("187.30")


@pytest.mark.asyncio
async def test_get_raw_data_returns_none_for_unknown():
    index_repo = SimpleNamespace()
    index_rate_repo = SimpleNamespace()
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    async def get_all():
        return []

    company_repo.get_all = get_all

    service = DataHealthService(index_repo, index_rate_repo, company_repo, price_repo)
    result = await service.get_raw_data("company", "UNKNOWN", page=1, page_size=50)

    assert result is None


@pytest.mark.asyncio
async def test_get_raw_data_invalid_entity_type():
    index_repo = SimpleNamespace()
    index_rate_repo = SimpleNamespace()
    company_repo = SimpleNamespace()
    price_repo = SimpleNamespace()

    service = DataHealthService(index_repo, index_rate_repo, company_repo, price_repo)
    result = await service.get_raw_data("invalid", "CDR", page=1, page_size=50)

    assert result is None
