from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pandas as pd
import pytest
from yfinance.exceptions import YFRateLimitError

from services.history_feeder import HistoricalDataFeeder


@pytest.fixture
def mock_session():
    return SimpleNamespace()


@pytest.fixture
def mock_repos():
    return {
        "company_repo": AsyncMock(),
        "stock_price_repo": AsyncMock(),
        "exchange_repo": AsyncMock(),
        "index_repo": AsyncMock(),
        "index_rate_repo": AsyncMock(),
    }


@pytest.fixture
def mock_yf_client():
    return AsyncMock()


@pytest.fixture
def feeder(mock_session, mock_repos, mock_yf_client, parquet_tracker):
    feeder = HistoricalDataFeeder(
        session=mock_session,
        tracker=parquet_tracker,
        yf_client=mock_yf_client,
    )
    feeder.company_repo = mock_repos["company_repo"]
    feeder.stock_price_repo = mock_repos["stock_price_repo"]
    feeder.exchange_repo = mock_repos["exchange_repo"]
    feeder.index_repo = mock_repos["index_repo"]
    feeder.index_rate_repo = mock_repos["index_rate_repo"]
    return feeder


def test_parse_single_ticker_df(feeder):
    df = pd.DataFrame(
        {
            "Open": [100.0, 101.0],
            "High": [105.0, 106.0],
            "Low": [99.0, 100.0],
            "Close": [103.0, 104.0],
            "Adj Close": [102.0, 103.0],
            "Volume": [1000000, 1100000],
        },
        index=pd.to_datetime(["2025-01-01", "2025-01-02"]),
    )

    records = feeder._parse_single_ticker_df(df, "CDR.WA", {"CDR.WA": 1})

    assert len(records) == 2
    assert records[0]["company_id"] == 1
    assert records[0]["open"] == Decimal("100.0")
    assert records[0]["volume"] == Decimal("1000000")


def test_parse_batch_multi_ticker(feeder):
    arrays = [
        [
            "CDR.WA",
            "CDR.WA",
            "CDR.WA",
            "CDR.WA",
            "CDR.WA",
            "CDR.WA",
            "PKN.WA",
            "PKN.WA",
            "PKN.WA",
            "PKN.WA",
            "PKN.WA",
            "PKN.WA",
        ],
        ["Open", "High", "Low", "Close", "Adj Close", "Volume"] * 2,
    ]
    tuples = list(zip(arrays[0], arrays[1], strict=True))
    index = pd.MultiIndex.from_tuples(tuples)

    df = pd.DataFrame(
        [
            [
                100.0,
                105.0,
                99.0,
                103.0,
                102.0,
                1000000,
                50.0,
                52.0,
                49.0,
                51.0,
                50.5,
                500000,
            ]
        ],
        index=pd.to_datetime(["2025-01-01"]),
        columns=index,
    )

    records = feeder._parse_batch_dataframe(
        df, ["CDR.WA", "PKN.WA"], {"CDR.WA": 1, "PKN.WA": 2}
    )

    assert len(records) == 2
    cdr_records = [r for r in records if r["company_id"] == 1]
    pkn_records = [r for r in records if r["company_id"] == 2]
    assert len(cdr_records) == 1
    assert len(pkn_records) == 1
    assert cdr_records[0]["open"] == Decimal("100.0")
    assert pkn_records[0]["open"] == Decimal("50.0")


def test_parse_batch_skips_unknown_ticker(feeder):
    df = pd.DataFrame(
        {
            "Open": [100.0],
            "High": [105.0],
            "Low": [99.0],
            "Close": [103.0],
            "Adj Close": [102.0],
            "Volume": [1000000],
        },
        index=pd.to_datetime(["2025-01-01"]),
    )

    records = feeder._parse_single_ticker_df(df, "UNKNOWN.WA", {"CDR.WA": 1})

    assert len(records) == 0


def test_parse_batch_skips_nan_rows(feeder):
    df = pd.DataFrame(
        {
            "Open": [100.0, float("nan")],
            "High": [105.0, float("nan")],
            "Low": [99.0, float("nan")],
            "Close": [103.0, float("nan")],
            "Adj Close": [102.0, float("nan")],
            "Volume": [1000000, float("nan")],
        },
        index=pd.to_datetime(["2025-01-01", "2025-01-02"]),
    )

    records = feeder._parse_single_ticker_df(df, "CDR.WA", {"CDR.WA": 1})

    assert len(records) == 1


def test_row_to_record_returns_none_for_missing(feeder):
    row = pd.Series({"Open": 100.0, "High": 105.0})
    result = feeder._row_to_record(row, 1, pd.Timestamp("2025-01-01"))
    assert result is None


def test_to_decimal_converts_float(feeder):
    result = feeder._to_decimal(1.23)
    assert result == Decimal("1.23")


def test_to_decimal_returns_none_for_none(feeder):
    assert feeder._to_decimal(None) is None
    assert feeder._to_decimal(float("nan")) is None


def test_to_decimal_returns_none_for_invalid(feeder):
    assert feeder._to_decimal("abc") is None


@pytest.mark.asyncio
async def test_rate_limit_retries_with_backoff(feeder, mock_yf_client):
    mock_yf_client.get_history_batch.side_effect = YFRateLimitError()

    with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        await feeder._download_and_save_companies(["CDR.WA"], {"CDR.WA": 1})

    assert mock_yf_client.get_history_batch.call_count == 3
    assert mock_sleep.call_count == 3


@pytest.mark.asyncio
async def test_rate_limit_exhausted_sets_failed(
    feeder, mock_yf_client, parquet_tracker
):
    mock_yf_client.get_history_batch.side_effect = YFRateLimitError()

    with patch("asyncio.sleep", new_callable=AsyncMock):
        await feeder._download_and_save_companies(["CDR.WA"], {"CDR.WA": 1})

    assert parquet_tracker.df.iloc[0]["status"] == "rate_limited"


@pytest.mark.asyncio
async def test_empty_dataframe_sets_empty_status(
    feeder, mock_yf_client, parquet_tracker
):
    mock_yf_client.get_history_batch.return_value = pd.DataFrame()

    await feeder._download_and_save_companies(["CDR.WA"], {"CDR.WA": 1})

    assert parquet_tracker.df.iloc[0]["status"] == "empty"


@pytest.mark.asyncio
async def test_success_calls_bulk_upsert(feeder, mock_yf_client, mock_repos):
    df = pd.DataFrame(
        {
            "Open": [100.0],
            "High": [105.0],
            "Low": [99.0],
            "Close": [103.0],
            "Adj Close": [102.0],
            "Volume": [1000000],
        },
        index=pd.to_datetime(["2025-01-01"]),
    )
    mock_yf_client.get_history_batch.return_value = df

    await feeder._download_and_save_companies(["CDR.WA"], {"CDR.WA": 1})

    mock_repos["stock_price_repo"].bulk_upsert.assert_called_once()
    records = mock_repos["stock_price_repo"].bulk_upsert.call_args[0][0]
    assert len(records) == 1
    assert records[0]["company_id"] == 1


@pytest.mark.asyncio
async def test_success_updates_tracker(feeder, mock_yf_client, parquet_tracker):
    df = pd.DataFrame(
        {
            "Open": [100.0],
            "High": [105.0],
            "Low": [99.0],
            "Close": [103.0],
            "Adj Close": [102.0],
            "Volume": [1000000],
        },
        index=pd.to_datetime(["2025-01-01"]),
    )
    mock_yf_client.get_history_batch.return_value = df

    await feeder._download_and_save_companies(["CDR.WA"], {"CDR.WA": 1})

    assert parquet_tracker.df.iloc[0]["status"] == "success"


@pytest.mark.asyncio
async def test_fresh_symbols_skipped(feeder, mock_yf_client, parquet_tracker):
    parquet_tracker.update("CDR.WA", "company", "success")

    await feeder._feed_companies_batch(["CDR.WA"], {"CDR.WA": 1})

    mock_yf_client.get_history_batch.assert_not_called()


def test_parse_single_ticker_df_without_adj_close(feeder):
    df = pd.DataFrame(
        {
            "Open": [100.0, 101.0],
            "High": [105.0, 106.0],
            "Low": [99.0, 100.0],
            "Close": [103.0, 104.0],
            "Volume": [1000000, 1100000],
        },
        index=pd.to_datetime(["2025-01-01", "2025-01-02"]),
    )

    records = feeder._parse_single_ticker_df(df, "CDR.WA", {"CDR.WA": 1})

    assert len(records) == 2
    assert records[0]["company_id"] == 1
    assert records[0]["open"] == Decimal("100.0")
    assert records[0]["close"] == Decimal("103.0")
    assert records[0]["adj_close"] == Decimal("103.0")
    assert records[0]["volume"] == Decimal("1000000")


def test_row_to_record_fallback_adj_close_to_close(feeder):
    row = pd.Series(
        {
            "Open": 100.0,
            "High": 105.0,
            "Low": 99.0,
            "Close": 103.0,
            "Volume": 1000000,
        }
    )
    result = feeder._row_to_record(row, 1, pd.Timestamp("2025-01-01"))
    assert result is not None
    assert result["close"] == Decimal("103.0")
    assert result["adj_close"] == Decimal("103.0")


def test_row_to_index_record_fallback_adj_close_to_close(feeder):
    row = pd.Series(
        {
            "Open": 100.0,
            "High": 105.0,
            "Low": 99.0,
            "Close": 103.0,
            "Volume": 1000000,
        }
    )
    result = feeder._row_to_index_record(row, 1, pd.Timestamp("2025-01-01"))
    assert result is not None
    assert result["close"] == Decimal("103.0")
    assert result["adj_close"] == Decimal("103.0")


@pytest.mark.asyncio
async def test_no_data_parsed_status_when_df_not_empty_but_no_records(
    feeder, mock_yf_client, parquet_tracker
):
    df = pd.DataFrame(
        {
            "Open": [float("nan")],
            "High": [float("nan")],
            "Low": [float("nan")],
            "Close": [float("nan")],
            "Volume": [float("nan")],
        },
        index=pd.to_datetime(["2025-01-01"]),
    )
    mock_yf_client.get_history_batch.return_value = df

    await feeder._download_and_save_companies(["CDR.WA"], {"CDR.WA": 1})

    assert parquet_tracker.df.iloc[0]["status"] == "no_data_parsed"


@pytest.mark.asyncio
async def test_validate_tracker_consistency_marks_stale(
    feeder, mock_repos, parquet_tracker
):
    parquet_tracker.update("CDR.WA", "company", "success")

    mock_repos["stock_price_repo"].get_all_companies_data_summary.return_value = [
        {
            "id": 1,
            "symbol": "CDR",
            "yahoo_symbol": "CDR.WA",
            "name": "CD Projekt",
            "min_date": None,
            "max_date": None,
            "count": 0,
        }
    ]
    mock_repos["index_rate_repo"].get_all_indexes_data_summary.return_value = []

    await feeder._validate_tracker_consistency()

    assert parquet_tracker.is_stale("CDR.WA", "company", threshold_days=30)
    assert parquet_tracker.df.iloc[0]["status"] == "stale"


@pytest.mark.asyncio
async def test_feed_companies_calls_company_feed_only(feeder, mock_repos):
    mock_repos["stock_price_repo"].get_all_companies_data_summary.return_value = []
    mock_repos["index_rate_repo"].get_all_indexes_data_summary.return_value = []
    mock_repos["company_repo"].get_all.return_value = [
        SimpleNamespace(id=10, active=True, exchange_id=1, yahoo_symbol="CDR.WA")
    ]
    mock_repos["exchange_repo"].get_all.return_value = [
        SimpleNamespace(id=1, symbol="GPW")
    ]

    companies_batch = AsyncMock()
    indexes_feed = AsyncMock()
    with (
        patch.object(feeder, "_feed_companies_batch", new=companies_batch),
        patch.object(feeder, "_feed_exchange_indexes", new=indexes_feed),
    ):
        await feeder.feed_companies()

    companies_batch.assert_awaited_once_with(["CDR.WA"], {"CDR.WA": 10})
    indexes_feed.assert_not_called()


@pytest.mark.asyncio
async def test_feed_indexes_calls_index_feed_only(feeder, mock_repos):
    mock_repos["stock_price_repo"].get_all_companies_data_summary.return_value = []
    mock_repos["index_rate_repo"].get_all_indexes_data_summary.return_value = []
    mock_repos["exchange_repo"].get_all.return_value = [
        SimpleNamespace(id=1, symbol="GPW")
    ]

    indexes_feed = AsyncMock()
    companies_batch = AsyncMock()
    with (
        patch.object(feeder, "_feed_exchange_indexes", new=indexes_feed),
        patch.object(feeder, "_feed_companies_batch", new=companies_batch),
    ):
        await feeder.feed_indexes()

    indexes_feed.assert_awaited_once_with(1, "GPW")
    companies_batch.assert_not_called()
