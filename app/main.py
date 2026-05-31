import os
import time
import json
from typing import TypeAlias
from dotenv import load_dotenv
from db.database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from  api.exchange_rates import router as rates_router

JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()

NBP_URLS = json.loads(os.getenv('NBP_API_TABLES'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL'))

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

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

app.include_router(rates_router)

@app.get("/health")
def health():
    return {"status": "ok"}


def save_nbp_data(nbp_data: JSON) -> bool:
    return True

def main():
    print("Application start")

    while True:
        time.sleep(1)

    


if __name__ == "__main__":
    main()



