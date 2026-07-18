from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    ALEMBIC_DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=".env")

    NBP_API_TABLE_A: str
    NBP_API_TABLE_B: str
    NBP_API_TABLE_C: str
    UPDATE_INTERVAL: int
    NBP_API_TABLES: str
    YFINANCE_CRYPTOCURRENCIES: str

    HISTORY_FEED_BATCH_SIZE: int = 30
    HISTORY_FEED_SLEEP_MIN: float = 1.0
    HISTORY_FEED_SLEEP_MAX: float = 2.0
    HISTORY_FEED_RATE_LIMIT_BASE_DELAY: int = 30
    HISTORY_FEED_RATE_LIMIT_MAX_RETRIES: int = 3
    HISTORY_FEED_STALE_THRESHOLD_DAYS: int = 30

    STOCK_COMPANIES_MIN_THRESHOLD: int = 100
    STOCK_COMPANIES_DEFAULT_FILE: str = "config/default_stock_companies.json"


settings = Settings()
