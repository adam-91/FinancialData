from services.scheduler import get_scheduler_info


def test_get_scheduler_info_returns_all_entries():
    info = get_scheduler_info()

    assert info["timezone"] == "Europe/Warsaw"
    ids = [entry["id"] for entry in info["entries"]]
    assert ids == [
        "sync_noon_tables_A_B",
        "sync_morning_table_C",
        "sync_all_tables",
        "historical_feed",
    ]


def test_cron_entries_have_schedule():
    info = get_scheduler_info()
    cron = [entry for entry in info["entries"] if entry["trigger"] == "cron"]

    assert len(cron) == 2
    for entry in cron:
        assert entry["day_of_week"] == "mon-fri"
        assert entry["hour"] is not None
        assert entry["minute"] is not None
        assert "next_run" in entry


def test_non_scheduled_entries_have_triggers():
    info = get_scheduler_info()
    triggers = {
        entry["id"]: entry["trigger"]
        for entry in info["entries"]
        if entry["trigger"] != "cron"
    }

    assert triggers["sync_all_tables"] == "startup"
    assert triggers["historical_feed"] == "startup_manual"
