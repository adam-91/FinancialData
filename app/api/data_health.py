from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_exchange_index_rate import StockExchangeIndexRateRepository
from db.repositories.stock_index import StockIndexRepository
from db.repositories.stock_price import StockPriceRepository
from dto.data_health_dto import (
    DataHealthSummary,
    EntityHealthDetail,
    RawDataResponse,
)
from services.data_health_service import DataHealthService
from services.history_feeder import run_historical_feed
from services.parquet_tracker import ParquetTracker

router = APIRouter(prefix="/api/health", tags=["health"])


def get_data_health_service(
    db: AsyncSession = Depends(get_session),
) -> DataHealthService:
    return DataHealthService(
        StockIndexRepository(db),
        StockExchangeIndexRateRepository(db),
        StockCompanyRepository(db),
        StockPriceRepository(db),
    )


@router.get("/data/summary", response_model=DataHealthSummary)
async def get_data_summary(
    service: DataHealthService = Depends(get_data_health_service),
):
    return await service.get_summary()


@router.get("/data/indices", response_model=list[EntityHealthDetail])
async def get_all_indices_health(
    service: DataHealthService = Depends(get_data_health_service),
):
    indexes_summary = await service.index_rate_repo.get_all_indexes_data_summary()
    result = []
    for idx in indexes_summary:
        result.append(
            EntityHealthDetail(
                symbol=idx["symbol"],
                name=idx["name"],
                min_date=idx["min_date"],
                max_date=idx["max_date"],
                record_count=idx["count"],
            )
        )
    return result


@router.get("/data/indices/{symbol}", response_model=EntityHealthDetail)
async def get_index_health(
    symbol: str,
    service: DataHealthService = Depends(get_data_health_service),
):
    result = await service.get_index_detail(symbol)
    if result is None:
        raise HTTPException(status_code=404, detail="Index not found")
    return result


@router.get("/data/companies", response_model=list[EntityHealthDetail])
async def get_all_companies_health(
    service: DataHealthService = Depends(get_data_health_service),
):
    companies_summary = await service.price_repo.get_all_companies_data_summary()
    result = []
    for comp in companies_summary:
        result.append(
            EntityHealthDetail(
                symbol=comp["symbol"],
                name=comp["name"],
                min_date=comp["min_date"],
                max_date=comp["max_date"],
                record_count=comp["count"],
            )
        )
    return result


@router.get("/data/companies/{symbol}", response_model=EntityHealthDetail)
async def get_company_health(
    symbol: str,
    service: DataHealthService = Depends(get_data_health_service),
):
    result = await service.get_company_detail(symbol)
    if result is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return result


@router.get("/data/raw/{entity_type}/{symbol}", response_model=RawDataResponse)
async def get_raw_data(
    entity_type: str,
    symbol: str,
    page: int = 1,
    page_size: int = 50,
    service: DataHealthService = Depends(get_data_health_service),
):
    if entity_type not in ("index", "company"):
        raise HTTPException(
            status_code=400, detail="entity_type must be 'index' or 'company'"
        )

    result = await service.get_raw_data(entity_type, symbol, page, page_size)
    if result is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return result


@router.post("/data/reset-tracker")
async def reset_fetch_tracker(refetch: bool = True):
    tracker = ParquetTracker()
    tracker.reset()

    if refetch:
        await run_historical_feed()

    return {"status": "ok", "refetch_triggered": refetch}
