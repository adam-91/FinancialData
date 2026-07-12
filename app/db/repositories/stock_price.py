from datetime import date

from dto.stock_price_dto import (
    StockPriceCreateDTO,
    StockPriceDTO,
    StockPriceFullDTO,
)
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from db.models.stock_company import StockCompany
from db.models.stock_price import StockPrice
from db.repositories.base import AsyncRepository


class StockPriceRepository(
    AsyncRepository[StockPrice, StockPriceCreateDTO, StockPriceDTO | StockPriceFullDTO]
):
    model = StockPrice
    output_schema = StockPriceDTO | StockPriceFullDTO

    async def get_stock_price(
            self, 
            company_id:int, 
            date:date | None = None, 
            with_stock: bool = False
            ) -> StockPriceDTO | StockPriceFullDTO | None:
        
        stmt = select(StockPriceDTO)
        if with_stock:
            stmt = stmt.options(joinedload(StockPrice.stock))
        stmt = stmt.where(
            StockPriceDTO.company_id == company_id
        )
        if date is None:
            stmt = stmt.order_by(StockPrice.trading_date.desc())
            stmt = stmt.limit(1)
        else:
            stmt = stmt.where(StockPriceDTO.trading_date == date)

        result =  await self.session.scalar(stmt)
        db_model = result.scalar_one_or_none()
    
        if not db_model:
            return None
    
        if with_stock:
            return StockPriceFullDTO.model_validate(db_model)
        
        return StockPriceDTO.model_validate(db_model)
    
    async def get_stock_price_by_symbol(
            self, 
            symbol:str, 
            date:date, 
            yahoo=True,
            with_stock: bool = False
            ) -> StockPriceDTO | StockPriceFullDTO | None:
        stmt = select(StockPriceDTO).options(joinedload(StockPrice.stock))
        if yahoo:
            stmt = stmt.where(StockCompany.yahoo_symbol == symbol)
        else:
             stmt = stmt.where(StockCompany.symbol == symbol)
        stmt = stmt.where(
            StockPriceDTO.trading_date == date,
        )

        result =  await self.session.scalar(stmt)
        db_model = result.scalar_one_or_none()
    
        if not db_model:
            return None
    
        if with_stock:
            return StockPriceFullDTO.model_validate(db_model)
        
        return StockPriceDTO.model_validate(db_model)
    
    async def get_stock_price_from_period(
            self, 
            company_id:int, 
            start_date:date, 
            end_date:date
            ) -> StockPriceDTO | None:
        stmt = select(StockPriceDTO)
        stmt = stmt.where(StockPriceDTO.company_id == company_id)
        stmt = stmt.where(
            StockPriceDTO.trading_date.between(start_date, end_date)
        )

        return await self.session.scalar(stmt)
    
    async def get_stock_price_from_period_by_symbol(
            self, 
            symbol:str, 
            start_date:date, 
            end_date:date,
            yahoo=True
        ) -> StockPriceDTO | None:
        stmt = select(StockPriceDTO)
        if yahoo:
            stmt = stmt.where(StockPriceDTO.yahoo_symbol == symbol)
        else:
            stmt = stmt.where(StockPriceDTO.symbol == symbol)
        stmt = stmt.where(
            StockPriceDTO.trading_date.between(start_date, end_date)
        )

        return await self.session.scalar(stmt)
    
    