from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DataHealthSummary(BaseModel):
    total_indices: int
    indices_with_data: int
    indices_percent: float
    total_companies: int
    companies_with_data: int
    companies_percent: float
    warnings: list[str] = []


class EntityHealthDetail(BaseModel):
    symbol: str
    name: str
    min_date: date | None
    max_date: date | None
    record_count: int


class RawDataEntry(BaseModel):
    trading_date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int


class RawDataResponse(BaseModel):
    symbol: str
    name: str
    total: int
    page: int
    page_size: int
    data: list[RawDataEntry]


class SchedulerEntryDTO(BaseModel):
    id: str
    trigger: str
    day_of_week: str | None = None
    hour: int | None = None
    minute: int | None = None
    interval_minutes: int | None = None
    next_run: str | None = None


class SchedulerInfoDTO(BaseModel):
    timezone: str
    entries: list[SchedulerEntryDTO]
