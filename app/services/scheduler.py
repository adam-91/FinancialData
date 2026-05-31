import time
import os
from dotenv import load_dotenv
from datetime import datetime
from decimal import Decimal
import schedule
from db.repositories.currency import CurrencyRepository
from integrations.NBP.currency_feed import fetch_NBP_data
from integrations.NBP.currency_schema import validate

load_dotenv()
 
async def update_currency_rates(url: str, table_name: str):

    print(f"[{datetime.now()}] Start rates downloading from table {table_name}")

    try:
        response = await fetch_NBP_data(url)
        if response.status == "failed":
            print(f'Downloading staus: {response.status}, status code: {response.status_code}, error: {response.error}')
            raise ValueError("Downloading error")
        if response.status == None:
            print('Data are not availiable today')
            return 
        
        validate_response = validate(url, response.response)

        if validate_response == False:
            raise ValueError("Wrong data")
           

    except Exception as err:
        print(f"Data download general error {err}")

    try:
        curriencies = CurrencyRepository.get_all()
        

    except Exception as err:
        print(f"Data insert general error {err}")

    print(response.response)

    url = os.getenv('NBP_API_TABLE_A')
    schedule.every().monday.at('12:15','Europe/Warsaw').do(update_currency_rates(url,'a'))
    schedule.every().tuesday.at('12:15','Europe/Warsaw').do(update_currency_rates(url,'a'))
    schedule.every().wednesday.at('12:15','Europe/Warsaw').do(update_currency_rates(url,'a'))
    schedule.every().thursday.at('12:15','Europe/Warsaw').do(update_currency_rates(url,'a'))
    schedule.every().friday.at('12:15','Europe/Warsaw').do(update_currency_rates(url,'a'))

    url = os.getenv('NBP_API_TABLE_B')
    schedule.every().wednesday.at('12:15','Europe/Warsaw').do(update_currency_rates(url,'b'))

    url = os.getenv('NBP_API_TABLE_C')
    schedule.every().monday.at('08:15','Europe/Warsaw').do(update_currency_rates(url,'c'))
    schedule.every().tuesday.at('08:15','Europe/Warsaw').do(update_currency_rates(url,'c'))
    schedule.every().wednesday.at('08:15','Europe/Warsaw').do(update_currency_rates(url),'c')
    schedule.every().thursday.at('08:15','Europe/Warsaw').do(update_currency_rates(url),'c')
    schedule.every().friday.at('08:15','Europe/Warsaw').do(update_currency_rates(url),'c')

print("Scheduler uruchomiony")

update_currency_rates(os.getenv('NBP_API_TABLE_A'),'a')
update_currency_rates(os.getenv('NBP_API_TABLE_B'),'b')
update_currency_rates(os.getenv('NBP_API_TABLE_C'),'c')

while True:
    schedule.run_pending()
    time.sleep(30)