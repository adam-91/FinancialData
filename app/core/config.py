from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    DATABASE_URL: str

    class Config:
        env_file = ".env"

    NBP_API_TABLE_A: str
    NBP_API_TABLE_B: str
    NBP_API_TABLE_C: str
    UPDATE_INTERVAL: int
    NBP_API_TABLES: str
    YFINANCE_CRYPTOCURRENCIES: str

settings = Settings()