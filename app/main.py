from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.currency import router as currency_router
from api.exchange_rates import router as rates_router
from config.data_init import create_start_data
from services.history_feeder import run_historical_feed
from services.scheduler import scheduler, start_scheduler
from services.startup_sync import sync_all_tables

type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()


async def initialize_database():
    await create_start_data()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # try:
    await initialize_database()

    await sync_all_tables()
    print("Startup sync end")

    # except Exception as err:
    # print(f"Startup sync failed: {err}")

    try:
        await run_historical_feed()
    except Exception as err:
        print(f"Historical feed failed: {err}")

    start_scheduler()

    yield

    scheduler.shutdown()


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
app.include_router(currency_router)
app.include_router(rates_router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    pass
