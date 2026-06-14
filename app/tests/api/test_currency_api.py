from fastapi.testclient import TestClient
import pytest

from main import app

pytestmark = pytest.mark.asyncio(loop_scope="session")

@pytest.mark.asyncio
async def test_get_currencies_returns_200(client: TestClient):
    response = await client.get("/api/currencies/")

    assert  response.status_code == 200