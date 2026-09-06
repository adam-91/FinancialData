import pytest

from core.security import hash_password
from db.models.user import User
from db.repositories.user import UserRepository

pytestmark = pytest.mark.asyncio(loop_scope="session")

ADMIN_EMAIL = "auth-test@example.com"
ADMIN_PASSWORD = "Secret123"


async def _create_user(
    db_session,
    email: str = ADMIN_EMAIL,
    password: str = ADMIN_PASSWORD,
    must_change: bool = False,
) -> User:
    repo = UserRepository(db_session)
    user = User(
        email=email,
        hashed_password=hash_password(password),
        must_change_password=must_change,
        is_active=True,
    )
    await repo.create(user)
    await repo.save()
    return user


async def _login(client, email=ADMIN_EMAIL, password=ADMIN_PASSWORD):
    return await client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )


@pytest.mark.asyncio
async def test_login_success_sets_cookie_and_me(client, db_session):
    await _create_user(db_session)

    response = await _login(client)
    assert response.status_code == 200
    assert response.json()["email"] == ADMIN_EMAIL
    assert response.json()["must_change_password"] is False
    assert "access_token" in response.cookies

    me = await client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == ADMIN_EMAIL


@pytest.mark.asyncio
async def test_login_with_must_change_flag(client, db_session):
    await _create_user(db_session, must_change=True)

    response = await _login(client)
    assert response.status_code == 200
    assert response.json()["must_change_password"] is True


@pytest.mark.asyncio
async def test_login_wrong_password(client, db_session):
    await _create_user(db_session)

    response = await _login(client, password="WrongPass1")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_without_auth_returns_401(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_users_requires_auth(client):
    response = await client.get("/api/admin/users")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_create_and_list_users(client, db_session):
    await _create_user(db_session)
    await _login(client)

    created = await client.post(
        "/api/admin/users",
        json={"email": "second@example.com", "password": "Second123"},
    )
    assert created.status_code == 201
    assert created.json()["must_change_password"] is True

    listing = await client.get("/api/admin/users")
    assert listing.status_code == 200
    emails = {u["email"] for u in listing.json()}
    assert "second@example.com" in emails


@pytest.mark.asyncio
async def test_change_password_clears_must_change(client, db_session):
    await _create_user(db_session, must_change=True)
    await _login(client)

    response = await client.post(
        "/api/auth/change-password",
        json={"current_password": ADMIN_PASSWORD, "new_password": "NewSecret1"},
    )
    assert response.status_code == 200
    assert response.json()["must_change_password"] is False


@pytest.mark.asyncio
async def test_reset_password_flow(client, db_session):
    user = await _create_user(db_session)
    await _login(client)

    reset = await client.post(f"/api/admin/users/{user.id}/reset-password")
    assert reset.status_code == 200
    reset_url = reset.json()["reset_url"]
    token = reset_url.split("token=")[1]

    response = await client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": "ResetPass1"},
    )
    assert response.status_code == 200
