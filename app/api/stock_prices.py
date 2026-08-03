from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_price import StockPriceRepository
from dto.stock_price_response import StockHistoryResponse, StockWithPriceResponse
from services.stock_prices_service import StockPricesService

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


def get_stock_prices_service(
    db: AsyncSession = Depends(get_session),
) -> StockPricesService:
    return StockPricesService(
        StockCompanyRepository(db),
        StockPriceRepository(db),
    )


@router.get("/prices/", response_model=list[StockWithPriceResponse])
async def get_stock_prices(
    service: StockPricesService = Depends(get_stock_prices_service),
):
    return await service.get_all_prices()


@router.get("/prices/{symbol}/history", response_model=StockHistoryResponse)
async def get_stock_history(
    symbol: str,
    period: str = "1y",
    service: StockPricesService = Depends(get_stock_prices_service),
):
    result = await service.get_stock_history(symbol, period)
    if result is None:
        raise HTTPException(status_code=404, detail="Stock not found")
    return result
