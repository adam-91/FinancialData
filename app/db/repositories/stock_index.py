from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from db.models.stock_exchange_index_rate import StockExchangeIndexRate
from db.models.stock_exchange_index import StockExchangeIndex
from db.repositories.base import AsyncRepository
from dto.stock_exchange_dto import (
    StockExchangeIndexCreateDTO,
    StockExchangeIndexDTO,
    StockExchangeIndexRateDTO,
)


class StockIndexRepository(
    AsyncRepository[
        StockExchangeIndex, 
        StockExchangeIndexCreateDTO, 
        StockExchangeIndexDTO
        ]
):
    model = StockExchangeIndex
    output_schema = StockExchangeIndexDTO

    async def get_exchange_index(
            self, 
            identyfier: int | str
            ) -> StockExchangeIndexDTO | None:
        stmt = select(StockExchangeIndexDTO)
        if isinstance(identyfier, int):
            stmt = stmt.where(StockExchangeIndexDTO.id == identyfier)
        elif isinstance(identyfier, str):
            stmt = stmt.where(StockExchangeIndexDTO.symbol == identyfier)

        result =  await self.session.scalar(stmt)
        db_model = result.scalar_one_or_none()
    
        if not db_model:
            return None
        
        return StockExchangeIndexDTO.model_validate(db_model)
    
    async def get_exchange_indexes(
            self, 
            stock_exchange: str | None = None
            ) -> list[StockExchangeIndexDTO] | None:
        
        stmt = select(StockExchangeIndex)
        if stock_exchange is not None:
            stmt = stmt.where(StockExchangeIndex.stock_exchange == stock_exchange)
        
        result =  await self.session.scalar(stmt)
        db_model = result.scalars().all()
    
        if not db_model:
            return None
        
        return [
            StockExchangeIndexDTO.model_validate(item)
            for item in db_model
        ]
    
    async def get_exchange_index_rates(
            self, 
            index: int | list[int] | str,
            trading_date: date | None = None
            ) -> list[StockExchangeIndexRateDTO] | None:
        stmt = select(StockExchangeIndexRate)
        limit = 1
        if isinstance(index, int):
            stmt = stmt.where(StockExchangeIndexRate.index_id == index)
        elif isinstance(index, list[int]):
            limit = len(index)
            stmt = stmt.where(StockExchangeIndexRate.index_id._in(index))
        elif isinstance(index, str):
            stmt = stmt.options(joinedload(StockExchangeIndex.name))
            stmt = stmt.where(StockExchangeIndex.name == index)

        if date is None:
             
            stmt = stmt.order_by(StockExchangeIndexRate.trading_date.desc())
            stmt = stmt.limit(limit)

        result =  await self.session.scalar(stmt)
        db_model = result.scalar().all()
    
        if not db_model:
            return None
        
        return StockExchangeIndexRateDTO.model_validate(db_model)