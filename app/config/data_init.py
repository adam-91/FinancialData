import os
from pathlib import Path

import structlog
import yaml
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.security import hash_password
from db.database import AsyncSessionFactory
from db.models.user import User
from db.repositories.stock_exchange import StockExchangeRepository
from db.repositories.stock_exchange_index import StockExchangeIndexRepository
from db.repositories.user import UserRepository

logger = structlog.get_logger()


def load_yaml_data(file_path: str, key: str) -> list[dict]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Nie znaleziono pliku konfiguracyjnego: {file_path}")

    with open(file_path, encoding="utf-8") as file:
        data = yaml.safe_load(file)
        return data.get(key, [])


def StockExchangeRead(file_name, key):
    CURRENT_DIR = Path(__file__).parent
    FILE_PATH = CURRENT_DIR / file_name
    logger.debug("Loading YAML config", file=file_name, key=key)
    return load_yaml_data(FILE_PATH, key)


async def InserStartData(session, stock_exchanges, stock_exchange_indexes):
    repo = StockExchangeRepository(session)
    await repo.add_exchanges(stock_exchanges)
    logger.info("New stock exchanges added")
    repo = StockExchangeIndexRepository(session)
    await repo.add_exchange_indexes(stock_exchange_indexes)
    logger.info("New stock exchange indexes added")


async def create_admin_account(session: AsyncSession) -> None:
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        logger.info("ADMIN_EMAIL/ADMIN_PASSWORD not set - skipping admin creation")
        return

    repo = UserRepository(session)
    existing = await repo.get_by_email(settings.ADMIN_EMAIL)
    if existing is not None:
        return

    admin = User(
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        must_change_password=True,
        is_active=True,
    )
    await repo.create(admin)
    await repo.save()
    logger.info("Initial admin account created", email=settings.ADMIN_EMAIL)


async def create_start_data(session: AsyncSession = None):
    stock_exchanges = StockExchangeRead("stock_exchange.yaml", "exchanges")
    stock_exchange_indexes = StockExchangeRead("stock_exchange_indexes.yaml", "indexes")

    if session is None:
        async with AsyncSessionFactory() as session:
            await InserStartData(session, stock_exchanges, stock_exchange_indexes)
            await create_admin_account(session)
    else:
        await InserStartData(session, stock_exchanges, stock_exchange_indexes)
        await create_admin_account(session)

    return False
