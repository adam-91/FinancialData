from typing import TypeAlias
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.exchange_rates import router as rates_router
from api.currency import router as currency_router
from services.startup_sync import (sync_all_tables)
from services.scheduler import (start_scheduler, scheduler)


JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):    
    #try:
    print(f"Startup sync start")

    await sync_all_tables()
    print(f"Startup sync end")

    #except Exception as err:
        #print(f"Startup sync failed: {err}")

    start_scheduler()

    yield

    scheduler.shutdown()

app = FastAPI(
    title="Financial Data",
    version="1.0.0",
    lifespan=lifespan
)

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


