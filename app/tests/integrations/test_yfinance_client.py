from datetime import date, timedelta

import pandas as pd
import pytest

from integrations.yfinance.client import YahooFinanceClient


@pytest.fixture
def yf_client():
    return YahooFinanceClient()


@pytest.mark.asyncio
@pytest.mark.integration
async def test_get_history_single_ticker(yf_client):
    end_date = date.today()
    start_date = end_date - timedelta(days=30)

    df = await yf_client.get_history("CDR.WA", start_date, end_date)

    assert not df.empty
    assert "Open" in df.columns
    assert "High" in df.columns
    assert "Low" in df.columns
    assert "Close" in df.columns
    assert "Volume" in df.columns


@pytest.mark.asyncio
@pytest.mark.integration
async def test_get_history_batch_multi_ticker(yf_client):
    df = await yf_client.get_history_batch(["CDR.WA", "PKN.WA"], period="1mo")

    assert not df.empty
    assert isinstance(df.columns, pd.MultiIndex)
    assert "CDR.WA" in df.columns.get_level_values(0)
    assert "PKN.WA" in df.columns.get_level_values(0)


@pytest.mark.asyncio
@pytest.mark.integration
async def test_get_history_batch_single_ticker(yf_client):
    df = await yf_client.get_history_batch(["CDR.WA"], period="1mo")

    assert not df.empty


@pytest.mark.asyncio
@pytest.mark.integration
async def test_get_last_session(yf_client):
    df = await yf_client.get_last_session("CDR.WA")

    assert not df.empty
    assert len(df) <= 1


@pytest.mark.asyncio
@pytest.mark.integration
async def test_get_history_invalid_ticker(yf_client):
    df = await yf_client.get_history(
        "INVALID_TICKER_12345",
        date.today() - timedelta(days=30),
        date.today(),
    )

    assert df.empty
