import logging

from services.exchange_rate_sync_runner import sync_nbp_table

logger = logging.getLogger(__name__)


async def sync_all_tables():
    logger.info("Starting sync of all NBP tables")

    await sync_nbp_table("NBP_API_TABLE_A")
    await sync_nbp_table("NBP_API_TABLE_B")
    await sync_nbp_table("NBP_API_TABLE_C")

    logger.info("Completed sync of all NBP tables")


async def sync_ab_tables():
    logger.info("Starting scheduled sync of tables A and B")

    await sync_nbp_table("NBP_API_TABLE_A")
    await sync_nbp_table("NBP_API_TABLE_B")

    logger.info("Completed scheduled sync of tables A and B")


async def sync_c_table():
    logger.info("Starting scheduled sync of table C")
    await sync_nbp_table("NBP_API_TABLE_C")
    logger.info("Completed scheduled sync of table C")
