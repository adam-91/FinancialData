import os
import time
#import asyncio
from typing import TypeAlias
from dotenv import load_dotenv
from db.database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import integrations.NBP.currency_feed as nbp
import integrations.NBP.currency_schema as cdv
import integrations.yfinance.yfinance_stock_feed as ysf
import integrations.yfinance.stock_data_validation as sdv
from  api.exchange_rates import router as rates_router

JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()

NBP_URLS = eval(os.getenv('NBP_API_TABLES'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL'))

Base.metadata.create_all(engine)

app = FastAPI(
    title="Financial Data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rates_router)

@app.get("/health")
def health():
    return {"status": "ok"}

print("Tables created")

def save_nbp_data(nbp_data: JSON) -> bool:
    return True

def main():
    print("Application start")

    while True:
        time.sleep(1)

    


if __name__ == "__main__":
    main()



