import os

from db.database import AsyncSessionFactory
from integrations.NBP.currency_feed import fetch_NBP_data
from integrations.NBP.currency_schema import validate
from services.exchange_rate_sync import ExchangeRateSyncService


async def sync_nbp_table(url: str):

    response = await fetch_NBP_data(os.getenv(url))

    if response["status"] != "success":
        print(f"NBP download failed: {response}")
        return

    dto = validate(url, response["response"])

    if not dto:
        print(f"Validation failed for {url}")
        return

    async with AsyncSessionFactory() as session:
        service = ExchangeRateSyncService(session)

        await service.sync(dto)
