import httpx 
from httpx_retries import RetryTransport, Retry
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('NBP_API_TABLE_A')
retry = Retry(total=3,
              backoff_factor=0.5
              )

async def fetch_NBP_data(url: str) -> dict:
    try:
        async with httpx.AsyncClient(transport=RetryTransport(retry=retry)) as client:
            response = await client.get(url, timeout=5)
            print(response.status_code)
    
            return {"status": "success", "status_code": response.status_code,"json": response.json()}
    except httpx.HTTPError as err:
        return  {"status": "failed", "status_code": response.status_code, "error": err}
    

asyncio.run(fetch_NBP_data(url)) 