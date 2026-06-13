import os
import sys
import pytest
from pathlib import Path
from alembic import command
from alembic.config import Config
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from testcontainers.postgres import PostgresContainer
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
 
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from db.database import get_session
 

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def db_container():
    with PostgresContainer("postgres:16-alpine") as postgres:
        yield postgres

@pytest.fixture(scope="session")
def alembic_migrations(db_container):
    ALEMBIC_INI = (Path(__file__).resolve().parents[2] /  "app" / "alembic.ini")

    sync_url = db_container.get_connection_url()
    os.environ["ALEMBIC_DATABASE_URL"] = sync_url
    alembic_cfg = Config(str(ALEMBIC_INI))
    alembic_cfg.set_main_option("sqlalchemy.url", sync_url)
    alembic_cfg.set_main_option("script_location", "app/alembic")
    
    # Wykonujemy migracje
    command.upgrade(alembic_cfg, "head")

    yield

@pytest_asyncio.fixture(scope="session")
async def async_engine(db_container, alembic_migrations):
    sync_url = db_container.get_connection_url()
    async_url = (
        sync_url
        .replace("postgresql://", "postgresql+asyncpg://")
        .replace("postgresql+psycopg2://", "postgresql+asyncpg://")
    )
    
    engine = create_async_engine(async_url, echo=False)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(async_engine):
    async with async_engine.connect() as connection:
        async with connection.begin() as transaction:
  
            async_session = AsyncSession(
                bind=connection, 
                expire_on_commit=False,
                join_transaction_mode="create_savepoint"
            )
            
            yield async_session
            await transaction.rollback()

@pytest_asyncio.fixture(scope="function")
async def client(db_session):

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_session] = _override_get_db
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        

    app.dependency_overrides.clear()

@pytest_asyncio.fixture(scope="session")
async def stock_factory():

    def _factory(**kwargs):
        defaults = {
            "symbol": "PKN",
            "yahoo_symbol": "PKN.WA",
            "name": "Orlen S.A",
            "exchange": "GPW",
            "active": True
        }

        defaults.update(kwargs)

        return Stock(**defaults)

    return _factory