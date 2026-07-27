from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.stock_exchange_index_rate import StockExchangeIndexRateRepository
from db.repositories.stock_index import StockIndexRepository
from dto.index_response import IndexHistoryResponse, IndexResponse
from services.indices_service import IndicesService

router = APIRouter(prefix="/api/indices", tags=["indices"])


def get_indices_service(
    db: AsyncSession = Depends(get_session),
) -> IndicesService:
    return IndicesService(
        StockIndexRepository(db),
        StockExchangeIndexRateRepository(db),
    )


@router.get("/", response_model=list[IndexResponse])
async def get_indices(
    service: IndicesService = Depends(get_indices_service),
):
    return await service.get_all_indices()


@router.get("/{symbol}/history", response_model=IndexHistoryResponse)
async def get_index_history(
    symbol: str,
    period: str = "1y",
    service: IndicesService = Depends(get_indices_service),
):
    result = await service.get_index_history(symbol, period)
    if result is None:
        raise HTTPException(status_code=404, detail="Index not found")
    return result
