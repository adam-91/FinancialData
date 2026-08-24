from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from dto.currency_analytics import (
    CorrelationResponse,
    DailyChangeSeries,
    MovingAverageSeries,
)
from services.currency_analytics_service import CurrencyAnalyticsService

router = APIRouter(prefix="/api/currencies/analytics", tags=["currency-analytics"])


def get_currency_analytics_service(
    db: AsyncSession = Depends(get_session),
) -> CurrencyAnalyticsService:
    return CurrencyAnalyticsService(
        CurrencyRepository(db),
        ExchangeMidRateRepository(db),
        ExchangeBuySellRateRepository(db),
    )


def _parse_codes(codes: str) -> list[str]:
    return [c.strip().upper() for c in codes.split(",") if c.strip()]


@router.get("/daily-change", response_model=list[DailyChangeSeries])
async def get_daily_change(
    codes: str,
    service: CurrencyAnalyticsService = Depends(get_currency_analytics_service),
) -> list[DailyChangeSeries]:
    return await service.get_daily_change(_parse_codes(codes))


@router.get("/moving-average", response_model=list[MovingAverageSeries])
async def get_moving_average(
    codes: str,
    window: int = Query(default=30, ge=1, le=365),
    service: CurrencyAnalyticsService = Depends(get_currency_analytics_service),
) -> list[MovingAverageSeries]:
    return await service.get_moving_average(_parse_codes(codes), window)


@router.get("/correlation", response_model=CorrelationResponse)
async def get_correlation(
    codes: str,
    service: CurrencyAnalyticsService = Depends(get_currency_analytics_service),
) -> CorrelationResponse:
    return await service.get_correlation(_parse_codes(codes))
