import structlog

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from services.startup_sync import sync_ab_tables, sync_c_table

logger = structlog.get_logger()

scheduler = AsyncIOScheduler(timezone="Europe/Warsaw")


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")

    scheduler.add_job(
        sync_ab_tables,
        id="sync_noon_tables_A_B",
        replace_existing=True,
        trigger="cron",
        day_of_week="mon-fri",
        hour=12,
        minute=15,
    )
    logger.info("Scheduled job: sync tables A and B at 12:15 Mon-Fri")

    scheduler.add_job(
        sync_c_table,
        id="sync_morning_table_C",
        replace_existing=True,
        trigger="cron",
        day_of_week="mon-fri",
        hour=8,
        minute=15,
    )
    logger.info("Scheduled job: sync table C at 08:15 Mon-Fri")
