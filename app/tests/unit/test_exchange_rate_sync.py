from decimal import Decimal
from types import SimpleNamespace

import pytest

from services.exchange_rate_sync import ExchangeRateSyncService


@pytest.mark.asyncio
async def test_sync_creates_missing_currency():
    session = SimpleNamespace()

    async def flush():
        return None

    async def commit():
        return None

    session.flush = flush
    session.commit = commit

    service = ExchangeRateSyncService(session)

    created = []

    async def get_all():
        if not created:
            return []

        return [
            SimpleNamespace(
                id=1,
                code="USD",
                name="US Dollar",
            )
        ]

    async def create_many(items):
        created.extend(items)

    async def upsert(*args, **kwargs):
        return None

    service.currency_repo.get_all = get_all
    service.currency_repo.create_many = create_many

    service.rate_mid_repo.upsert = upsert
    service.rate_bas_repo.upsert = upsert

    dto = SimpleNamespace(
        effectiveDate="2025-01-01",
        rates=[
            SimpleNamespace(
                code="USD",
                currency="US Dollar",
                mid=4.11,
            )
        ],
    )

    await service.sync(dto)

    assert len(created) == 1
    assert created[0].code == "USD"


@pytest.mark.asyncio
async def test_sync_does_not_create_existing_currency():
    existing = SimpleNamespace(
        id=1,
        code="USD",
        name="US Dollar",
    )

    created = []

    async def get_all():
        return [existing]

    async def create_many(items):
        created.extend(items)

    async def flush():
        pass

    async def commit():
        pass

    async def upsert(*args, **kwargs):
        pass

    session = SimpleNamespace(
        flush=flush,
        commit=commit,
    )

    service = ExchangeRateSyncService(session)

    service.currency_repo.get_all = get_all
    service.currency_repo.create_many = create_many

    service.rate_mid_repo.upsert = upsert
    service.rate_bas_repo.upsert = upsert

    dto = SimpleNamespace(
        effectiveDate="2025-01-01",
        rates=[
            SimpleNamespace(
                code="USD",
                currency="US Dollar",
                mid=4.11,
            )
        ],
    )

    await service.sync(dto)

    assert created == []


@pytest.mark.asyncio
async def test_sync_saves_bid_ask_rates():
    existing = SimpleNamespace(
        id=1,
        code="USD",
        name="US Dollar",
    )

    saved = []

    async def get_all():
        return [existing]

    async def upsert(rate):
        saved.append(rate)

    async def commit():
        pass

    async def flush():
        pass

    session = SimpleNamespace(
        commit=commit,
        flush=flush,
    )

    service = ExchangeRateSyncService(session)

    service.currency_repo.get_all = get_all

    service.rate_bas_repo.upsert = upsert
    service.rate_mid_repo.upsert = lambda *_: None

    dto = SimpleNamespace(
        effectiveDate="2025-01-01",
        rates=[
            SimpleNamespace(
                code="USD",
                currency="US Dollar",
                bid=4.0011,
                ask=4.2021,
            )
        ],
    )

    await service.sync(dto)

    assert len(saved) == 1
    assert saved[0].bid == Decimal("4.0011")
    assert saved[0].ask == Decimal("4.2021")
