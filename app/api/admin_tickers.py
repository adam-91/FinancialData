import asyncio

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user
from db.database import get_session
from db.models.user import User
from dto.admin_ticker_dto import (
    AdminCompanyDTO,
    ExchangeOptionDTO,
    IndexCreateDTO,
    TickerCreateDTO,
    YfinanceTestRequest,
    YfinanceTestResponse,
)
from dto.stock_exchange_dto import StockExchangeIndexDTO
from services.history_feeder import run_historical_feed
from services.ticker_admin_service import TickerAdminService

router = APIRouter(prefix="/api/admin", tags=["admin-tickers"])


def get_ticker_admin_service(
    db: AsyncSession = Depends(get_session),
) -> TickerAdminService:
    return TickerAdminService(db)


@router.get("/exchanges", response_model=list[ExchangeOptionDTO])
async def list_exchanges(
    service: TickerAdminService = Depends(get_ticker_admin_service),
    _: User = Depends(get_current_user),
):
    return await service.list_exchanges()


@router.get("/tickers", response_model=list[AdminCompanyDTO])
async def list_tickers(
    service: TickerAdminService = Depends(get_ticker_admin_service),
    _: User = Depends(get_current_user),
):
    return await service.list_companies()


@router.post("/tickers", response_model=AdminCompanyDTO, status_code=201)
async def create_ticker(
    payload: TickerCreateDTO,
    force: bool = False,
    service: TickerAdminService = Depends(get_ticker_admin_service),
    _: User = Depends(get_current_user),
):
    company = await service.create_company(payload, force=force)
    if payload.auto_fetch:
        asyncio.create_task(run_historical_feed())
    return company


@router.get("/indices", response_model=list[StockExchangeIndexDTO])
async def list_indices(
    service: TickerAdminService = Depends(get_ticker_admin_service),
    _: User = Depends(get_current_user),
):
    return await service.list_indices()


@router.post("/indices", response_model=StockExchangeIndexDTO, status_code=201)
async def create_index(
    payload: IndexCreateDTO,
    force: bool = False,
    service: TickerAdminService = Depends(get_ticker_admin_service),
    _: User = Depends(get_current_user),
):
    index = await service.create_index(payload, force=force)
    if payload.auto_fetch:
        asyncio.create_task(run_historical_feed())
    return index


@router.post("/yfinance/test", response_model=YfinanceTestResponse)
async def test_yfinance(
    payload: YfinanceTestRequest,
    service: TickerAdminService = Depends(get_ticker_admin_service),
    _: User = Depends(get_current_user),
):
    result = await service.test_symbol(payload.symbol)
    return YfinanceTestResponse(**result)
