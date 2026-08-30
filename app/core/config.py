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

    HISTORY_FEED_BATCH_SIZE: int = 10
    HISTORY_FEED_SLEEP_MIN: float = 1.0
    HISTORY_FEED_SLEEP_MAX: float = 2.0
    HISTORY_FEED_RATE_LIMIT_BASE_DELAY: int = 30
    HISTORY_FEED_RATE_LIMIT_MAX_RETRIES: int = 3
    HISTORY_FEED_STALE_THRESHOLD_DAYS: int = 30
    HISTORY_FEED_INTERVAL_MINUTES: int = 60

    STOCK_COMPANIES_MIN_THRESHOLD: int = 100
    STOCK_COMPANIES_DEFAULT_FILE: str = "config/default_stock_companies.json"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    AUTH_COOKIE_NAME: str = "access_token"

    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_TLS: bool = True


settings = Settings()
