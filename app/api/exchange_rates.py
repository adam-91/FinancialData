import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.repositories.currency import CurrencyRepository
from db.repositories.exchange_buy_and_sell_rate import ExchangeBuySellRateRepository
from db.repositories.exchange_mid_rate import ExchangeMidRateRepository
from db.repositories.exchange_rate import ExchangeRateService
from db.database import get_session
from integrations.NBP.currency_schema import ExchangeResponse

router = APIRouter(
    prefix="/api/rates",
    tags=["rates"]
)

def get_exchange_rate_service(
    db: AsyncSession = Depends(get_session),
) -> ExchangeRateService:

    return ExchangeRateService(
        CurrencyRepository(db),
        ExchangeMidRateRepository(db),
        ExchangeBuySellRateRepository(db),
    )

@router.get("/history/{currency_code}/date/{date}",response_model=ExchangeResponse)
async def get_rate_history(
    currency_code: str,
    date: datetime.date,
    service: ExchangeRateService = Depends(
        get_exchange_rate_service
    ),
):
    rate = await service.get_rate(
        currency_code,
        date,
    )

    if not rate:
        raise HTTPException(
            status_code=404,
            detail="Exchange rate not found for this date",
        )

    return rate

@router.get("/all", response_model=list[ExchangeResponse])
async def get_rates(service: ExchangeRateService = Depends(
        get_exchange_rate_service)):
    currencies =  await service.currency_repo.get_all()
    rates = []
    print(currencies)
    for currency  in currencies:
        data = await service.get_rate(currency.code,datetime.date.today())
        rates.append( data )
    if not rates:
        return None
        #raise HTTPException(status_code=404,detail="Currency not found")
    return rates

@router.get("/{currency_code}", response_model=ExchangeResponse)
async def get_rate(
    currency_code: str,
    service: ExchangeRateService = Depends(
        get_exchange_rate_service
    ),
):
    rate = await service.get_rate(
        currency_code,
        datetime.date.today(),
    )

    if not rate:
        raise HTTPException(status_code=404,detail="Currency not found  for this date")
    return rate



