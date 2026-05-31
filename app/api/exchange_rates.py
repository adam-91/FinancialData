from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.repositories.exchange_rate import ExchangeRateService
from db.database import get_db
from integrations.NBP.currency_schema import ExchangeResponse, NBP_AB_table
from integrations.NBP.currency_service import map_to_bas_models

router = APIRouter(
    prefix="/api/rates",
    tags=["rates"]
)


@router.get(
    "/latest",
    response_model=list[ExchangeResponse]
)
def get_latest_rates(
    db: Session = Depends(get_db)
):
    return ExchangeRateService.get_rate(get_db) 


@router.get(
    "/history/{currency_code}",
    response_model=list[ExchangeResponse]
)
def get_rate_history(
    currency_code: str,
    db: Session = Depends(get_db)
):
    rates = ExchangeRateService.get_rate(get_db, db,  currency_code)

    if not rates:
        raise HTTPException(
            status_code=404,
            detail="Currency not found"
        )

    return rates