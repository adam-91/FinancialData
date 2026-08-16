from contextlib import asynccontextmanager

import structlog
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.currency import router as currency_router
from api.data_health import router as data_health_router
from api.exchange_rates import router as rates_router
from api.indices import router as indices_router
from api.logs import router as logs_router
from api.stock_companies import router as stock_companies_router
from api.stock_prices import router as stock_prices_router
from config.data_init import create_start_data
from core.config import settings
from core.logging_config import setup_logging
from core.security import hash_password
from db.database import AsyncSessionFactory
from db.models.user import User, UserRole
from db.repositories.user import UserRepository
from services.history_feeder import run_historical_feed
from services.scheduler import scheduler, start_scheduler
from services.startup_sync import sync_all_tables
from services.stock_company_sync import sync_stock_companies_if_needed

type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()
setup_logging()

logger = structlog.get_logger()


async def initialize_database():
    logger.info("Initializing database with seed data")
    await create_start_data()
    logger.info("Database initialization completed")


async def seed_admin_user():
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        return

    async with AsyncSessionFactory() as session:
        repo = UserRepository(session)
        existing = await repo.get_by_email(settings.ADMIN_EMAIL)
        if existing:
            return

        admin = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        await repo.create(admin)
        logger.info("Admin user created", email=settings.ADMIN_EMAIL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup started")

    await initialize_database()

    await seed_admin_user()

    await sync_all_tables()
    logger.info("Startup sync completed")

    try:
        await sync_stock_companies_if_needed()
    except Exception as err:
        logger.critical("Stock companies sync failed", error=str(err))

    try:
        await run_historical_feed()
    except Exception as err:
        logger.critical("Historical feed failed", error=str(err))

    start_scheduler()
    logger.info("Application startup completed")

    yield

    scheduler.shutdown()
    logger.info("Application shutdown completed")


app = FastAPI(title="Financial Data", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(currency_router)
app.include_router(rates_router)
app.include_router(stock_companies_router)
app.include_router(indices_router)
app.include_router(stock_prices_router)
app.include_router(data_health_router)
app.include_router(logs_router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    pass
