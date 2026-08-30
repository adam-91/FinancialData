import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
async def test_scheduler_info_returns_200(client):
    response = await client.get("/api/health/scheduler")

    assert response.status_code == 200
    data = response.json()
    assert data["timezone"] == "Europe/Warsaw"
    assert len(data["entries"]) == 5
    assert {entry["id"] for entry in data["entries"]} == {
        "sync_noon_tables_A_B",
        "sync_morning_table_C",
        "historical_feed_background",
        "sync_all_tables",
        "historical_feed",
    }
