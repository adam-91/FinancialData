from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from dto.currency_history_response import CurrencyHistoryResponse
from integrations.NBP.currency_schema import CurrencyResponse
from services.currency_history_service import CurrencyHistoryService

router = APIRouter(prefix="/api/currencies", tags=["currency"])


async def get_currency_service(
    db: AsyncSession = Depends(get_session),
) -> CurrencyRepository:

    return CurrencyRepository(db)


def get_currency_history_service(
    db: AsyncSession = Depends(get_session),
) -> CurrencyHistoryService:
    return CurrencyHistoryService(
        CurrencyRepository(db),
        ExchangeMidRateRepository(db),
        ExchangeBuySellRateRepository(db),
    )


@router.get("/", response_model=list[CurrencyResponse])
async def get_currencies(repo: CurrencyRepository = Depends(get_currency_service)):
    return await repo.get_all()


@router.get("/{code}/history", response_model=CurrencyHistoryResponse)
async def get_currency_history(
    code: str,
    period: str = "1y",
    service: CurrencyHistoryService = Depends(get_currency_history_service),
):
    result = await service.get_currency_history(code, period)
    if result is None:
        raise HTTPException(status_code=404, detail="Currency not found")
    return result
