import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.config import settings
from services.history_feeder import run_scheduled_historical_feed
from services.startup_sync import sync_ab_tables, sync_c_table

logger = structlog.get_logger()

TIMEZONE = "Europe/Warsaw"

scheduler = AsyncIOScheduler(timezone=TIMEZONE)

SCHEDULED_JOBS = [
    {
        "id": "sync_noon_tables_A_B",
        "func": sync_ab_tables,
        "day_of_week": "mon-fri",
        "hour": 12,
        "minute": 15,
    },
    {
        "id": "sync_morning_table_C",
        "func": sync_c_table,
        "day_of_week": "mon-fri",
        "hour": 8,
        "minute": 15,
    },
]

INTERVAL_JOBS = [
    {
        "id": "historical_feed_background",
        "func": run_scheduled_historical_feed,
        "interval_minutes": settings.HISTORY_FEED_INTERVAL_MINUTES,
    },
]

NON_SCHEDULED_JOBS = [
    {
        "id": "sync_all_tables",
        "trigger": "startup",
    },
    {
        "id": "historical_feed",
        "trigger": "startup_manual",
    },
]


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")

    for job in SCHEDULED_JOBS:
        scheduler.add_job(
            job["func"],
            id=job["id"],
            replace_existing=True,
            trigger="cron",
            day_of_week=job["day_of_week"],
            hour=job["hour"],
            minute=job["minute"],
        )
        logger.info(
            "Scheduled job",
            id=job["id"],
            day_of_week=job["day_of_week"],
            hour=job["hour"],
            minute=job["minute"],
        )

    for job in INTERVAL_JOBS:
        scheduler.add_job(
            job["func"],
            id=job["id"],
            replace_existing=True,
            trigger="interval",
            minutes=job["interval_minutes"],
        )
        logger.info(
            "Scheduled interval job",
            id=job["id"],
            interval_minutes=job["interval_minutes"],
        )


def get_scheduler_info() -> dict:
    live_jobs = {job.id: job for job in scheduler.get_jobs()}

    entries = []
    for job in SCHEDULED_JOBS:
        next_run = None
        live = live_jobs.get(job["id"])
        if live is not None and live.next_run_time is not None:
            next_run = live.next_run_time.isoformat()

        entries.append(
            {
                "id": job["id"],
                "trigger": "cron",
                "day_of_week": job["day_of_week"],
                "hour": job["hour"],
                "minute": job["minute"],
                "next_run": next_run,
            }
        )

    for job in INTERVAL_JOBS:
        next_run = None
        live = live_jobs.get(job["id"])
        if live is not None and live.next_run_time is not None:
            next_run = live.next_run_time.isoformat()

        entries.append(
            {
                "id": job["id"],
                "trigger": "interval",
                "day_of_week": None,
                "hour": None,
                "minute": None,
                "interval_minutes": job["interval_minutes"],
                "next_run": next_run,
            }
        )

    for job in NON_SCHEDULED_JOBS:
        entries.append(
            {
                "id": job["id"],
                "trigger": job["trigger"],
                "day_of_week": None,
                "hour": None,
                "minute": None,
                "next_run": None,
            }
        )

    return {
        "timezone": TIMEZONE,
        "entries": entries,
    }
