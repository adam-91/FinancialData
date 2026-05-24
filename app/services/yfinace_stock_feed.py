import datetime as dt
import pandas as pd
import yfinance as yf
import requests
from dotenv import load_dotenv

load_dotenv()

url_stooq = "https://stooq.pl"
tickers = ["KGH"]

def read_yfinance_data(ticker: list[str], stock: str, period: str) -> pd.DataFrame:
    try:
        ticker = ticker + "." + stock
        response = yf.download(ticker, period=period)
         
        print(response)
        return response
    except requests.exceptions.ConnectionError:
        print({"status": "failed", "status_code": "-", "error": ConnectionError})
        return  {"status": "failed", "status_code": "-", "error": ConnectionError}

    except requests.exceptions.Timeout:
        print({"status": "failed", "status_code": "504 ", "error": "Timeout"})
        return  {"status": "failed", "status_code": "504 ", "error": "Timeout"}

    except Exception as err: 
        print({"status": "failed", "status_code": "-", "error": err})
        return  {"status": "failed", "status_code": "-", "error": err}

 


read_yfinance_data(tickers[0], "WA", "1y")
 







