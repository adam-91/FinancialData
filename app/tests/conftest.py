import asyncio
import os
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool
from testcontainers.postgres import PostgresContainer

from alembic import command

sys.path.insert(0, str(Path(__file__).parent.parent))

from db.database import get_session
from db.repositories.stock import StockRepository
from dto.stock import StockCreateDTO
from main import app


@pytest.fixture(scope="session")
def event_loop():
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def db_container():
    with PostgresContainer("postgres:16-alpine") as postgres:
        yield postgres


@pytest.fixture(scope="session")
def alembic_migrations(db_container):
    ALEMBIC_INI = Path(__file__).resolve().parents[2] / "app" / "alembic.ini"

    sync_url = db_container.get_connection_url()
    os.environ["ALEMBIC_DATABASE_URL"] = sync_url
    alembic_cfg = Config(str(ALEMBIC_INI))
    alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
    alembic_cfg.set_main_option("script_location", "app/alembic")

    command.upgrade(alembic_cfg, "head")

    yield


@pytest_asyncio.fixture(scope="session")
async def async_engine(db_container, alembic_migrations):

    sync_url = db_container.get_connection_url()

    async_url = sync_url.replace("postgresql://", "postgresql+asyncpg://").replace(
        "postgresql+psycopg2://", "postgresql+asyncpg://"
    )

    engine = create_async_engine(async_url, echo=False, poolclass=NullPool)
    engine.clear_compiled_cache()

    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(async_engine):
    async with async_engine.connect() as connection:
        async with connection.begin() as transaction:
            async_session = AsyncSession(
                bind=connection,
                expire_on_commit=False,
                join_transaction_mode="create_savepoint",
            )

            yield async_session
            await transaction.rollback()
            await connection.close()


@pytest_asyncio.fixture(scope="function")
async def client(db_session):

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_session] = _override_get_db
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


### STOCK ######################
@pytest.fixture(scope="function")
async def stock_repo(db_session):
    return StockRepository(db_session)


@pytest.fixture(scope="function")
def stock_factory():

    def _factory(**kwargs):
        defaults = {
            "symbol": "PKN",
            "yahoo_symbol": "PKN.WA",
            "name": "Orlen S.A",
            "exchange": "GPW",
            "active": True,
        }

        defaults.update(kwargs)

        return StockCreateDTO(**defaults)

    return _factory


@pytest_asyncio.fixture(scope="function")
async def stock_data(stock_factory, stock_repo):
    await stock_repo.create_many(
        [
            stock_factory(
                symbol="PKN",
                yahoo_symbol="PKN.WA",
                name="Orlen S.A",
                exchange="GPW",
                active=True,
            ),
            stock_factory(
                symbol="KGH",
                yahoo_symbol="KGH.WA",
                name="KGHM Polska Miedź S.A.",
                exchange="GPW",
                active=True,
            ),
            stock_factory(
                symbol="ABCT",
                yahoo_symbol="ABCT.WA",
                name="ABC Data S.A. / Asseco BS",
                exchange="GPW",
                active=False,
            ),
            stock_factory(
                symbol="MSFT",
                yahoo_symbol="MSFT",
                name="Microsoft Corporation",
                exchange="NYSE",
                active=True,
            ),
        ]
    )
