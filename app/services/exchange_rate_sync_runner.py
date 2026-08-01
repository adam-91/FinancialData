import logging
import os

from db.database import AsyncSessionFactory
from integrations.NBP.currency_feed import fetch_NBP_data
from integrations.NBP.currency_schema import validate
from services.exchange_rate_sync import ExchangeRateSyncService

logger = logging.getLogger(__name__)


async def sync_nbp_table(url: str):
    logger.info("Starting NBP table sync", url_env=url)

    response = await fetch_NBP_data(os.getenv(url))

    if response["status"] != "success":
        logger.error("NBP download failed", url_env=url, response=response)
        return

    dto = validate(url, response["response"])

    if not dto:
        logger.error("Validation failed for NBP data", url_env=url)
        return

    async with AsyncSessionFactory() as session:
        service = ExchangeRateSyncService(session)
        await service.sync(dto)

    logger.info("Completed NBP table sync", url_env=url)
