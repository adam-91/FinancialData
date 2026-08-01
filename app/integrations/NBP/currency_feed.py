import os
import structlog

import httpx
from dotenv import load_dotenv
from httpx_retries import Retry, RetryTransport

logger = structlog.get_logger()

type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

load_dotenv()

url = os.getenv("NBP_API_TABLE_A")
retry = Retry(total=3, backoff_factor=0.5)


async def fetch_NBP_data(url: str) -> dict:
    try:
        async with httpx.AsyncClient(transport=RetryTransport(retry=retry)) as client:
            response = await client.get(url, timeout=5)
            logger.info("NBP API response", status_code=response.status_code)
            return {
                "status": "success",
                "status_code": response.status_code,
                "response": response.json(),
            }
    except httpx.HTTPError as err:
        logger.error("NBP API request failed", error=str(err))
        return {"status": "failed", "error": str(err)}
