from datetime import datetime, timedelta

from services.parquet_tracker import ParquetTracker


def test_empty_tracker_all_symbols_stale(parquet_tracker):
    symbols = ["CDR.WA", "PKN.WA", "KGH.WA"]
    stale = parquet_tracker.get_stale_symbols(symbols, "company", 30)
    assert stale == symbols


def test_update_adds_new_symbol(parquet_tracker):
    parquet_tracker.update("CDR.WA", "company", "success")
    assert len(parquet_tracker.df) == 1
    assert parquet_tracker.df.iloc[0]["yahoo_symbol"] == "CDR.WA"
    assert parquet_tracker.df.iloc[0]["type"] == "company"
    assert parquet_tracker.df.iloc[0]["status"] == "success"


def test_update_existing_symbol(parquet_tracker):
    parquet_tracker.update("CDR.WA", "company", "success")
    first_fetch = parquet_tracker.df.iloc[0]["last_fetched_at"]

    parquet_tracker.update("CDR.WA", "company", "failed")
    assert len(parquet_tracker.df) == 1
    assert parquet_tracker.df.iloc[0]["status"] == "failed"
    assert parquet_tracker.df.iloc[0]["last_fetched_at"] >= first_fetch


def test_is_stale_false_for_recent(parquet_tracker):
    parquet_tracker.update("CDR.WA", "company", "success")
    assert parquet_tracker.is_stale("CDR.WA", "company", 30) is False


def test_is_stale_true_for_old(parquet_tracker):
    parquet_tracker.update("CDR.WA", "company", "success")
    old_date = datetime.now() - timedelta(days=31)
    parquet_tracker.df.loc[0, "last_fetched_at"] = old_date
    assert parquet_tracker.is_stale("CDR.WA", "company", 30) is True


def test_get_stale_symbols_filters(parquet_tracker):
    parquet_tracker.update("CDR.WA", "company", "success")
    parquet_tracker.update("PKN.WA", "company", "success")
    old_date = datetime.now() - timedelta(days=31)
    parquet_tracker.df.loc[
        parquet_tracker.df["yahoo_symbol"] == "PKN.WA", "last_fetched_at"
    ] = old_date

    symbols = ["CDR.WA", "PKN.WA", "KGH.WA"]
    stale = parquet_tracker.get_stale_symbols(symbols, "company", 30)

    assert "CDR.WA" not in stale
    assert "PKN.WA" in stale
    assert "KGH.WA" in stale


def test_save_and_load_roundtrip(test_parquet_path):
    tracker1 = ParquetTracker(parquet_path=test_parquet_path)
    tracker1.update("CDR.WA", "company", "success")
    tracker1.update("PKN.WA", "index", "failed")
    tracker1.save()

    tracker2 = ParquetTracker(parquet_path=test_parquet_path)
    assert len(tracker2.df) == 2
    assert tracker2.df.iloc[0]["yahoo_symbol"] == "CDR.WA"
    assert tracker2.df.iloc[1]["yahoo_symbol"] == "PKN.WA"
    assert tracker2.df.iloc[0]["status"] == "success"
    assert tracker2.df.iloc[1]["status"] == "failed"


def test_load_corrupted_file(test_parquet_path, tmp_path):
    corrupted_path = tmp_path / "corrupted.parquet"
    corrupted_path.write_text("not a parquet file")

    tracker = ParquetTracker(parquet_path=str(corrupted_path))
    assert tracker.df.empty
    assert list(tracker.df.columns) == [
        "yahoo_symbol",
        "type",
        "last_fetched_at",
        "status",
    ]
