import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

EMAIL = "prefs@example.com"
PASSWORD = "StrongPass1!"


async def _register_and_login(client):
    await client.post(
        "/api/auth/register",
        json={"email": EMAIL, "password": PASSWORD},
    )
    await client.post(
        "/api/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
    )


@pytest.mark.asyncio
async def test_get_preferences_requires_auth(client: TestClient):
    response = await client.get("/api/auth/preferences/")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_preferences_returns_defaults(client: TestClient):
    await _register_and_login(client)

    response = await client.get("/api/auth/preferences/")

    assert response.status_code == 200
    body = response.json()
    assert body["default_exchange"] is None
    assert body["default_currencies"] == []


@pytest.mark.asyncio
async def test_update_and_get_preferences(client: TestClient):
    await _register_and_login(client)

    payload = {"default_exchange": "NYSE", "default_currencies": ["EUR", "USD"]}
    put_response = await client.put("/api/auth/preferences/", json=payload)

    assert put_response.status_code == 200
    assert put_response.json() == payload

    get_response = await client.get("/api/auth/preferences/")
    assert get_response.status_code == 200
    assert get_response.json() == payload


@pytest.mark.asyncio
async def test_update_preferences_overwrites(client: TestClient):
    await _register_and_login(client)

    await client.put(
        "/api/auth/preferences/",
        json={"default_exchange": "GPW", "default_currencies": ["USD"]},
    )
    await client.put(
        "/api/auth/preferences/",
        json={"default_exchange": None, "default_currencies": []},
    )

    response = await client.get("/api/auth/preferences/")
    assert response.json() == {
        "default_exchange": None,
        "default_currencies": [],
    }
