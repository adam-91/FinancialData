from datetime import date
from types import SimpleNamespace

import pytest

from services.exchange_rate import ExchangeRateService


@pytest.mark.asyncio
async def test_get_rate_returns_complete_rate():
    currency_repo = SimpleNamespace()
    mid_repo = SimpleNamespace()
    buy_sell_repo = SimpleNamespace()

    currency_repo.get_by_code = lambda code: None

    async def get_currency(code):
        return SimpleNamespace(id=1, code="USD", name="US Dollar")

    async def get_mid(currency_id, effective_date):
        return SimpleNamespace(mid=4.12)

    async def get_buy_sell(currency_id, effective_date):
        return SimpleNamespace(bid=4.05, ask=4.20)

    currency_repo.get_by_code = get_currency
    mid_repo.get_rate = get_mid
    buy_sell_repo.get_rate = get_buy_sell

    service = ExchangeRateService(currency_repo, mid_repo, buy_sell_repo)

    result = await service.get_rate("USD", date(2025, 1, 1))

    assert result["code"] == "USD"
    assert result["currency"] == "US Dollar"
    assert result["mid"] == 4.12
    assert result["bid"] == 4.05
    assert result["ask"] == 4.20


@pytest.mark.asyncio
async def test_get_rate_raises_when_currency_not_found():
    currency_repo = SimpleNamespace()
    mid_repo = SimpleNamespace()
    buy_sell_repo = SimpleNamespace()

    async def get_currency(code):
        return None

    currency_repo.get_by_code = get_currency

    service = ExchangeRateService(currency_repo, mid_repo, buy_sell_repo)

    with pytest.raises(ValueError):
        await service.get_rate("XYZ", date.today())


@pytest.mark.asyncio
async def test_get_rate_returns_none_when_buy_sell_missing():
    async def get_currency(code):
        return SimpleNamespace(
            id=1,
            code="USD",
            name="US Dollar",
        )

    async def get_mid(*args):
        return SimpleNamespace(mid=4.12)

    async def get_buy_sell(*args):
        return None

    service = ExchangeRateService(
        SimpleNamespace(get_by_code=get_currency),
        SimpleNamespace(get_rate=get_mid),
        SimpleNamespace(get_rate=get_buy_sell),
    )

    result = await service.get_rate(
        "USD",
        date(2025, 1, 1),
    )

    assert result["mid"] == 4.12
    assert result["bid"] is None
    assert result["ask"] is None
