from apscheduler.schedulers.asyncio import (AsyncIOScheduler)

from services.startup_sync import (sync_ab_tables, sync_c_table)

scheduler = AsyncIOScheduler(
    timezone="Europe/Warsaw"
)


def start_scheduler():

    scheduler.add_job(
        sync_ab_tables,
        id="sync_noon_tables_A_B",
        replace_existing=True,
        trigger="cron",
        day_of_week="mon-fri",
        hour=12,
        minute=15,
    )

    scheduler.add_job(
        sync_c_table,
        id="sync_morning_table_C",
        replace_existing=True,
        trigger="cron",
        day_of_week="mon-fri",
        hour=8,
        minute=15,
    )

    scheduler.start()

    print("Scheduler start")