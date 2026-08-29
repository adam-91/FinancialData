import pytest

from core.security import hash_password
from db.models.user import User
from db.repositories.user import UserRepository

pytestmark = pytest.mark.asyncio(loop_scope="session")

ADMIN_EMAIL = "ticker-admin@example.com"
ADMIN_PASSWORD = "Secret123"


async def _create_admin(db_session) -> None:
    repo = UserRepository(db_session)
    existing = await repo.get_by_email(ADMIN_EMAIL)
    if existing is not None:
        return
    user = User(
        email=ADMIN_EMAIL,
        hashed_password=hash_password(ADMIN_PASSWORD),
        must_change_password=False,
        is_active=True,
    )
    await repo.create(user)
    await repo.save()


async def _login(client):
    return await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )


@pytest.mark.asyncio
async def test_tickers_requires_auth(client):
    response = await client.get("/api/admin/tickers")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_exchanges(client, db_session):
    await _create_admin(db_session)
    await _login(client)

    response = await client.get("/api/admin/exchanges")
    assert response.status_code == 200
    data = response.json()
    symbols = {e["symbol"] for e in data}
    assert "GPW" in symbols


@pytest.mark.asyncio
async def test_create_ticker_force(client, db_session):
    await _create_admin(db_session)
    await _login(client)

    response = await client.post(
        "/api/admin/tickers?force=true",
        json={
            "symbol": "TEST",
            "name": "Test Company",
            "exchange_symbol": "GPW",
            "yahoo_symbol": "TEST.WA",
            "auto_fetch": False,
        },
    )
    assert response.status_code == 201
    assert response.json()["yahoo_symbol"] == "TEST.WA"


@pytest.mark.asyncio
async def test_create_index_force(client, db_session):
    await _create_admin(db_session)
    await _login(client)

    response = await client.post(
        "/api/admin/indices?force=true",
        json={
            "symbol": "^WIGTEST",
            "name": "Test Index",
            "exchange_symbol": "GPW",
            "auto_fetch": False,
        },
    )
    assert response.status_code == 201
    assert response.json()["symbol"] == "^WIGTEST"
