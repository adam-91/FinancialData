import pandas as pd
from pathlib import Path
import requests
from enum import Enum
import json
from dotenv import load_dotenv
import time
import yfinance as yf

load_dotenv()

class GPW_Indexes(str, Enum):
    WIG20 = 'WIG20'
    mWIG40 = 'mWIG40'
    sWIG80 = 'sWIG80'

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

def load_ticekrs(index: GPW_Indexes) -> list[str]:
    try:
        BASE_DIR = Path(__file__).resolve().parent.parent
        file_path = BASE_DIR  / "gpw_tickers.json"
        print(file_path)
        
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            tickers = data[index].keys()
            return tickers
    except FileNotFoundError:
        print('Error: The file path is incorrect.')
        return None
    except json.JSONDecodeError:
        print('Error: The file contains invalid JSON syntax')
        return None

def load_WIG20() -> pd.DataFrame:
    tickers = load_ticekrs('WIG20')
    print(tickers)

    if len(tickers) == 0:
        return {"status": "failed", "status_code": 404, "response": "No tickers"}

    data = {}
    for ticker in tickers:
        print(ticker)
        data += read_yfinance_data(ticker, "WA", "1d")
        print(data)
        time.sleep(60)

    return {"status": "success", "status_code": 200, "response": data}

#load_WIG20()







