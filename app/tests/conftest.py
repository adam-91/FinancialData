import asyncio
import os
import sys
from pathlib import Path

import docker
import pytest
import pytest_asyncio
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool
from testcontainers.postgres import PostgresContainer

from alembic import command

sys.path.insert(0, str(Path(__file__).parent.parent))

from config.data_init import create_start_data
from db.database import get_session
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_exchange import StockExchangeRepository
from db.repositories.stock_exchange_index import StockExchangeIndexRepository
from dto.stock_company_dto import StockCompanyCreateDTO
from main import app
from services.parquet_tracker import ParquetTracker


@pytest.fixture(scope="session")
def event_loop():
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


def _docker_is_available() -> bool:
    try:
        client = docker.from_env()
        client.ping()
        return True
    except Exception:
        return False


@pytest.fixture(scope="session")
def db_container():
    if not _docker_is_available():
        pytest.skip(
            "Docker nie jest dostępny, więc testy integracyjne z PostgreSQL "
            "są pomijane."
        )

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

    async_session_local = async_sessionmaker(bind=engine, class_=AsyncSession)
    async with async_session_local() as session:
        await create_start_data(session)
        await session.commit()

    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
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


@pytest_asyncio.fixture
async def client(db_session):

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_session] = _override_get_db
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


### STOCK ######################
@pytest_asyncio.fixture
async def stock_company_repo(db_session):
    return StockCompanyRepository(db_session)


@pytest_asyncio.fixture
async def stock_exchange_repo(db_session):
    return StockExchangeRepository(db_session)


@pytest_asyncio.fixture
async def stock_exchange_indexes_repo(db_session):
    return StockExchangeIndexRepository(db_session)


@pytest.fixture
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

        return StockCompanyCreateDTO(**defaults)

    return _factory


@pytest_asyncio.fixture
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


@pytest.fixture
def test_parquet_path(tmp_path):
    return str(tmp_path / "test_tracker.parquet")


@pytest.fixture
def parquet_tracker(test_parquet_path):
    return ParquetTracker(parquet_path=test_parquet_path)
