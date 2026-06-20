from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.repositories.currency import CurrencyRepository
from integrations.NBP.currency_schema import CurrencyResponse

router = APIRouter(prefix="/api/currencies", tags=["currency"])


async def get_currency_service(
    db: AsyncSession = Depends(get_session),
) -> CurrencyRepository:

    return CurrencyRepository(db)


@router.get("/", response_model=list[CurrencyResponse])
async def get_currencies(repo: CurrencyRepository = Depends(get_currency_service)):
    return await repo.get_all()
