import os
import time
import asyncio
import psycopg
from typing import TypeAlias
from dotenv import load_dotenv
import services.nbp_currency_feed as nbp
import services.currency_data_validation as cdv
import services.yfinance_stock_feed as ysf
import services.stock_data_validation as sdv

#import pandas as pd

load_dotenv()

print("Connecting to database...")

connected = False

while not connected:
    try:
        conn = psycopg.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )

        connected = True

    except Exception as err:
        print("Database not ready yet...")
        print(err)
        time.sleep(2)

print("Connected!")

cur = conn.cursor()

JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

NBP_URLS = eval(os.getenv('NBP_API_TABLES'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL'))

def save_nbp_data(nbp_data: JSON) -> bool:
    return True

def main():
    print("Application start")

    while True:
        for table, url in NBP_URLS.items():
            print(f'table: {table}')
            nbp_data =  asyncio.run(nbp.fetch_NBP_data(url))
            if nbp_data['status'] == 'success':
                if cdv.validate(table,nbp_data['response']):
                    save_nbp_data(nbp_data)
                    print('saved!')
            else:
                print(f'Error with fetching NBP data, table {table}')

        wig_20 = ysf.load_WIG20() 


        if wig_20['status'] == 'success':
            if sdv.validate(wig_20['response']):
                    save_nbp_data(wig_20)
                    print('saved!')
            else:
                print(f'Error with WIG20 yfinance data')

        print(f'Sleep {UPDATE_INTERVAL} s')
        break
        #time.sleep(UPDATE_INTERVAL)


if __name__ == "__main__":
    main()



cur.execute("SELECT version();")

version = cur.fetchone()

print("PostgreSQL version:")
print(version)

cur.close()
conn.close()