from datetime import date

from pydantic import BaseModel


class DailyChangePoint(BaseModel):
    date: date
    change: float


class DailyChangeSeries(BaseModel):
    code: str
    currency: str
    data: list[DailyChangePoint]


class MovingAveragePoint(BaseModel):
    date: date
    value: float
    ma: float | None


class TrendInfo(BaseModel):
    direction: str
    percent: float


class MovingAverageSeries(BaseModel):
    code: str
    currency: str
    data: list[MovingAveragePoint]
    trend: TrendInfo


class CorrelationResponse(BaseModel):
    codes: list[str]
    values: list[list[float]]
