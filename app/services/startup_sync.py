from services.exchange_rate_sync_runner import sync_nbp_table


async def sync_all_tables():

    await sync_nbp_table("NBP_API_TABLE_A")

    await sync_nbp_table("NBP_API_TABLE_B")

    await sync_nbp_table("NBP_API_TABLE_C")


async def sync_ab_tables():

    await sync_nbp_table("NBP_API_TABLE_A")

    await sync_nbp_table("NBP_API_TABLE_B")


async def sync_c_table():
    await sync_nbp_table("NBP_API_TABLE_C")
