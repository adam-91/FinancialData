import json
from types import SimpleNamespace

import pytest

from services.stock_company_sync import StockCompanySyncService


@pytest.fixture
def mock_session():
    return SimpleNamespace()


@pytest.fixture
def mock_repos():
    return {
        "company_repo": SimpleNamespace(),
        "exchange_repo": SimpleNamespace(),
        "index_repo": SimpleNamespace(),
    }


@pytest.fixture
def service(mock_session, mock_repos):
    svc = StockCompanySyncService(mock_session)
    svc.company_repo = mock_repos["company_repo"]
    svc.exchange_repo = mock_repos["exchange_repo"]
    svc.index_repo = mock_repos["index_repo"]
    return svc


@pytest.mark.asyncio
async def test_sync_from_json_file(service, tmp_path, mock_repos):
    data = [
        {
            "symbol": "CDR",
            "yahoo_symbol": "CDR.WA",
            "name": "CD Projekt",
            "exchange": "GPW",
        },
        {
            "symbol": "PKN",
            "yahoo_symbol": "PKN.WA",
            "name": "ORLEN",
            "exchange": "GPW",
        },
    ]
    file_path = tmp_path / "test.json"
    file_path.write_text(json.dumps(data), encoding="utf-8")

    gpw_exchange = SimpleNamespace(id=1, symbol="GPW")

    async def get_exchange(symbol):
        if symbol == "GPW":
            return gpw_exchange
        return None

    async def bulk_upsert(companies):
        return len(companies)

    mock_repos["exchange_repo"].get_exchange = get_exchange
    mock_repos["company_repo"].bulk_upsert = bulk_upsert

    count = await service.sync_from_json_file(str(file_path))

    assert count == 2


@pytest.mark.asyncio
async def test_sync_from_json_file_not_found(service):
    with pytest.raises(FileNotFoundError):
        await service.sync_from_json_file("/nonexistent/file.json")


@pytest.mark.asyncio
async def test_sync_if_needed_below_threshold(service, mock_repos, tmp_path):
    async def get_count():
        return 50

    async def sync_from_json_file(path):
        return 10

    mock_repos["company_repo"].get_count = get_count
    service.sync_from_json_file = sync_from_json_file

    from unittest.mock import patch

    with (
        patch("services.stock_company_sync.Path.exists", return_value=True),
        patch(
            "services.stock_company_sync.settings.STOCK_COMPANIES_DEFAULT_FILE",
            str(tmp_path / "default.json"),
        ),
    ):
        result = await service.sync_if_needed()

    assert result is True


@pytest.mark.asyncio
async def test_sync_if_needed_above_threshold(service, mock_repos):
    async def get_count():
        return 150

    mock_repos["company_repo"].get_count = get_count

    result = await service.sync_if_needed()

    assert result is False


@pytest.mark.asyncio
async def test_add_single_company(service, mock_repos):
    gpw_exchange = SimpleNamespace(id=1, symbol="GPW")

    async def get_exchange(symbol):
        if symbol == "GPW":
            return gpw_exchange
        return None

    async def create(dto):
        return SimpleNamespace(
            id=1,
            symbol=dto.symbol,
            yahoo_symbol=dto.yahoo_symbol,
            name=dto.name,
            exchange_id=dto.stock_exchange_id,
            active=dto.active,
        )

    mock_repos["exchange_repo"].get_exchange = get_exchange
    mock_repos["company_repo"].create = create

    data = {
        "symbol": "CDR",
        "yahoo_symbol": "CDR.WA",
        "name": "CD Projekt",
        "exchange": "GPW",
        "active": True,
    }

    result = await service.add_single_company(data)

    assert result.symbol == "CDR"
    assert result.yahoo_symbol == "CDR.WA"


@pytest.mark.asyncio
async def test_add_single_company_exchange_not_found(service, mock_repos):
    async def get_exchange(symbol):
        return None

    mock_repos["exchange_repo"].get_exchange = get_exchange

    data = {
        "symbol": "CDR",
        "yahoo_symbol": "CDR.WA",
        "name": "CD Projekt",
        "exchange": "NONEXISTENT",
    }

    with pytest.raises(ValueError, match="Exchange not found"):
        await service.add_single_company(data)


@pytest.mark.asyncio
async def test_add_companies_to_index(service, mock_repos):
    index = SimpleNamespace(id=1, symbol="^WIG20")
    company1 = SimpleNamespace(id=1, yahoo_symbol="CDR.WA")
    company2 = SimpleNamespace(id=2, yahoo_symbol="PKN.WA")

    async def get_exchange_index(symbol):
        if symbol == "^WIG20":
            return index
        return None

    async def get_stock_instance_by_yahoo_symbol(symbol):
        if symbol == "CDR.WA":
            return company1
        if symbol == "PKN.WA":
            return company2
        return None

    async def add_companies_to_index(index_id, company_ids):
        return len(company_ids)

    mock_repos["index_repo"].get_exchange_index = get_exchange_index
    mock_repos[
        "company_repo"
    ].get_stock_instance_by_yahoo_symbol = get_stock_instance_by_yahoo_symbol
    mock_repos["index_repo"].add_companies_to_index = add_companies_to_index

    count = await service.add_companies_to_index("^WIG20", ["CDR.WA", "PKN.WA"])

    assert count == 2


@pytest.mark.asyncio
async def test_add_companies_to_index_not_found(service, mock_repos):
    async def get_exchange_index(symbol):
        return None

    mock_repos["index_repo"].get_exchange_index = get_exchange_index

    with pytest.raises(ValueError, match="Index not found"):
        await service.add_companies_to_index("^NONEXISTENT", ["CDR.WA"])


@pytest.mark.asyncio
async def test_remove_companies_from_index(service, mock_repos):
    index = SimpleNamespace(id=1, symbol="^WIG20")
    company1 = SimpleNamespace(id=1, yahoo_symbol="CDR.WA")

    async def get_exchange_index(symbol):
        if symbol == "^WIG20":
            return index
        return None

    async def get_stock_instance_by_yahoo_symbol(symbol):
        if symbol == "CDR.WA":
            return company1
        return None

    async def remove_companies_from_index(index_id, company_ids):
        return len(company_ids)

    mock_repos["index_repo"].get_exchange_index = get_exchange_index
    mock_repos[
        "company_repo"
    ].get_stock_instance_by_yahoo_symbol = get_stock_instance_by_yahoo_symbol
    mock_repos["index_repo"].remove_companies_from_index = remove_companies_from_index

    count = await service.remove_companies_from_index("^WIG20", ["CDR.WA"])

    assert count == 1


@pytest.mark.asyncio
async def test_get_companies_by_exchange(service, mock_repos):
    company1 = SimpleNamespace(
        id=1,
        symbol="CDR",
        yahoo_symbol="CDR.WA",
        name="CD Projekt",
        exchange_id=1,
        active=True,
    )

    async def get_by_exchange(exchange_symbol):
        return [company1]

    mock_repos["company_repo"].get_by_exchange = get_by_exchange

    result = await service.get_companies_by_exchange("GPW")

    assert len(result) == 1
    assert result[0].symbol == "CDR"


@pytest.mark.asyncio
async def test_get_companies_by_index(service, mock_repos):
    company1 = SimpleNamespace(
        id=1,
        symbol="CDR",
        yahoo_symbol="CDR.WA",
        name="CD Projekt",
        exchange_id=1,
        active=True,
    )

    async def get_by_index(index_symbol):
        return [company1]

    mock_repos["company_repo"].get_by_index = get_by_index

    result = await service.get_companies_by_index("^WIG20")

    assert len(result) == 1
    assert result[0].symbol == "CDR"
