import os
import time
#import asyncio
from typing import TypeAlias
from dotenv import load_dotenv
from db.database import Base, engine
import services.nbp_currency_feed as nbp
import services.currency_data_validation as cdv
import services.yfinance_stock_feed as ysf
import services.stock_data_validation as sdv

JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()

NBP_URLS = eval(os.getenv('NBP_API_TABLES'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL'))

Base.metadata.create_all(engine)

print("Tables created")

def save_nbp_data(nbp_data: JSON) -> bool:
    return True

def main():
    print("Application start")

    while True:
        time.sleep(1)

    


if __name__ == "__main__":
    main()



