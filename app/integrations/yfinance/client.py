from datetime import date
import requests
from fastapi import requests
import pandas as pd
from pydantic import BaseModel
import yfinance as yf

class YahooFinanceClient(BaseModel):

    model_config = {
            "from_attributes": True
        }
    
    async def get_history(
        yahoo_symbol: list[str],
        start_date: date,
        end_date: date,
    ) -> pd.DataFrame:
        try:
            response = yf.download(yahoo_symbol, start_date=start_date,end_date=end_date)
            return response
        except requests.exceptions.ConnectionError:
            return  {"status": "failed", "status_code": "-", "error": ConnectionError}
        except requests.exceptions.Timeout:
            return  {"status": "failed", "status_code": "504 ", "error": "Timeout"}
        except Exception as err: 
            return  {"status": "failed", "status_code": "-", "error": err}


    async def get_last_session(
        yahoo_symbol: list[str]) -> pd.DataFrame:
        try:
            response = yf.download(yahoo_symbol, period='1d')
            return response
        except requests.exceptions.ConnectionError:
            return  {"status": "failed", "status_code": "-", "error": ConnectionError}
        except requests.exceptions.Timeout:
            return  {"status": "failed", "status_code": "504 ", "error": "Timeout"}
        except Exception as err: 
            return  {"status": "failed", "status_code": "-", "error": err}
        