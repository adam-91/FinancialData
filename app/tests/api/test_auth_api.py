import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

EMAIL = "test@example.com"
PASSWORD = "StrongPass1!"


async def _register(client, email=EMAIL, password=PASSWORD):
    return await client.post(
        "/api/auth/register",
        json={"email": email, "password": password},
    )


async def _login(client, email=EMAIL, password=PASSWORD):
    return await client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )


@pytest.mark.asyncio
async def test_register_creates_user(client: TestClient):
    response = await _register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == EMAIL
    assert body["role"] == "user"
    assert body["is_active"] is True


@pytest.mark.asyncio
async def test_register_duplicate_email_conflict(client: TestClient):
    await _register(client)
    response = await _register(client)

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password_rejected(client: TestClient):
    response = await _register(client, password="weak")

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_sets_cookie(client: TestClient):
    await _register(client)
    response = await _login(client)

    assert response.status_code == 200
    assert "access_token" in response.cookies


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: TestClient):
    await _register(client)
    response = await _login(client, password="WrongPass1!")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client: TestClient):
    response = await client.get("/api/auth/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_user_after_login(client: TestClient):
    await _register(client)
    await _login(client)

    response = await client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == EMAIL


@pytest.mark.asyncio
async def test_logout_clears_cookie(client: TestClient):
    await _register(client)
    await _login(client)

    response = await client.post("/api/auth/logout")

    assert response.status_code == 200

    me_response = await client.get("/api/auth/me")
    assert me_response.status_code == 401


@pytest.mark.asyncio
async def test_change_password(client: TestClient):
    await _register(client)
    await _login(client)

    wrong = await client.post(
        "/api/auth/password/change",
        json={"old_password": "WrongPass1!", "new_password": "NewStrongPass1!"},
    )
    assert wrong.status_code == 400

    ok = await client.post(
        "/api/auth/password/change",
        json={"old_password": PASSWORD, "new_password": "NewStrongPass1!"},
    )
    assert ok.status_code == 200


@pytest.mark.asyncio
async def test_change_password_requires_auth(client: TestClient):
    response = await client.post(
        "/api/auth/password/change",
        json={"old_password": PASSWORD, "new_password": "NewStrongPass1!"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_reset_request_does_not_leak_existence(client: TestClient):
    response = await client.post(
        "/api/auth/password/reset-request",
        json={"email": "nobody@example.com"},
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_reset_confirm_invalid_token(client: TestClient):
    response = await client.post(
        "/api/auth/password/reset-confirm",
        json={"token": "invalid-token", "new_password": "NewStrongPass1!"},
    )

    assert response.status_code == 400
