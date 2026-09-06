from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from dto.admin_ticker_dto import IndexCreateDTO, TickerCreateDTO
from services.ticker_admin_service import TickerAdminService


class FakeYfClient:
    def __init__(self, found: bool = True):
        self.found = found
        self.checked = []

    async def check_symbol(self, symbol: str) -> dict:
        self.checked.append(symbol)
        if self.found:
            return {
                "found": True,
                "symbol": symbol,
                "last_close": 10.5,
                "last_date": "2026-01-01",
                "error": None,
            }
        return {
            "found": False,
            "symbol": symbol,
            "last_close": None,
            "last_date": None,
            "error": None,
        }


def _make_service(yf_client=None):
    service = TickerAdminService.__new__(TickerAdminService)
    service.session = SimpleNamespace()
    service.company_repo = SimpleNamespace()
    service.index_repo = SimpleNamespace()
    service.exchange_repo = SimpleNamespace()
    service.yf_client = yf_client or FakeYfClient()

    gpw = SimpleNamespace(id=1, symbol="GPW", ticker="WA")

    async def get_all():
        return [gpw]

    service.exchange_repo.get_all = get_all
    return service, gpw


@pytest.mark.asyncio
async def test_create_company_builds_yahoo_symbol_and_creates():
    service, _ = _make_service()

    async def get_by_yahoo_symbol(symbol):
        return None

    async def create_company(symbol, yahoo_symbol, name, exchange_id, active):
        return SimpleNamespace(
            id=1, symbol=symbol, yahoo_symbol=yahoo_symbol, name=name
        )

    async def save():
        return None

    service.company_repo.get_by_yahoo_symbol = get_by_yahoo_symbol
    service.company_repo.create_company = create_company
    service.company_repo.save = save

    dto = TickerCreateDTO(symbol="PKN", name="Orlen", exchange_symbol="GPW")
    result = await service.create_company(dto)

    assert result.yahoo_symbol == "PKN.WA"
    assert service.yf_client.checked == ["PKN.WA"]


@pytest.mark.asyncio
async def test_create_company_blocks_when_yfinance_not_found():
    service, _ = _make_service(yf_client=FakeYfClient(found=False))

    dto = TickerCreateDTO(symbol="NOPE", name="Nope", exchange_symbol="GPW")
    with pytest.raises(HTTPException) as exc:
        await service.create_company(dto)

    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_create_company_force_skips_yfinance_check():
    service, _ = _make_service(yf_client=FakeYfClient(found=False))

    async def get_by_yahoo_symbol(symbol):
        return None

    async def create_company(symbol, yahoo_symbol, name, exchange_id, active):
        return SimpleNamespace(id=1, symbol=symbol, yahoo_symbol=yahoo_symbol)

    async def save():
        return None

    service.company_repo.get_by_yahoo_symbol = get_by_yahoo_symbol
    service.company_repo.create_company = create_company
    service.company_repo.save = save

    dto = TickerCreateDTO(symbol="NOPE", name="Nope", exchange_symbol="GPW")
    result = await service.create_company(dto, force=True)

    assert result.yahoo_symbol == "NOPE.WA"
    assert service.yf_client.checked == []


@pytest.mark.asyncio
async def test_create_company_duplicate_raises_conflict():
    service, _ = _make_service()

    async def get_by_yahoo_symbol(symbol):
        return SimpleNamespace(id=1)

    service.company_repo.get_by_yahoo_symbol = get_by_yahoo_symbol

    dto = TickerCreateDTO(symbol="PKN", name="Orlen", exchange_symbol="GPW")
    with pytest.raises(HTTPException) as exc:
        await service.create_company(dto)

    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_create_index_blocks_when_yfinance_not_found():
    service, _ = _make_service(yf_client=FakeYfClient(found=False))

    dto = IndexCreateDTO(symbol="^WIG99", name="Test", exchange_symbol="GPW")
    with pytest.raises(HTTPException) as exc:
        await service.create_index(dto)

    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_create_index_creates():
    service, _ = _make_service()

    async def get_model_by_symbol(symbol):
        return None

    async def create_index(symbol, name, exchange_id, active):
        return SimpleNamespace(id=1, symbol=symbol, name=name)

    async def save():
        return None

    service.index_repo.get_model_by_symbol = get_model_by_symbol
    service.index_repo.create_index = create_index
    service.index_repo.save = save

    dto = IndexCreateDTO(symbol="^WIG99", name="Test", exchange_symbol="GPW")
    result = await service.create_index(dto)

    assert result.symbol == "^WIG99"


@pytest.mark.asyncio
async def test_create_company_exchange_not_found():
    service, _ = _make_service()

    async def get_all():
        return []

    service.exchange_repo.get_all = get_all

    dto = TickerCreateDTO(symbol="PKN", name="Orlen", exchange_symbol="GPW")
    with pytest.raises(HTTPException) as exc:
        await service.create_company(dto)

    assert exc.value.status_code == 404
