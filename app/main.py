import services.nbp_currency_feed as nbp
import services.currency_data_validation as cdv
from typing import TypeAlias
import asyncio

#import pandas as pd
import os
import time
from dotenv import load_dotenv

load_dotenv()
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
         
        print(f'Sleep {UPDATE_INTERVAL} s')
        break
        #time.sleep(UPDATE_INTERVAL)

if __name__ == "__main__":
    main()