from sqlalchemy import insert, inspect, select
from dto.stock import StockCreateDTO, StockDTO
from db.repositories.base import AsyncRepository


class StockRepository(AsyncRepository):
    model = StockDTO

    async def get_exchange_tickers(self, yahoo = True,exchange="GPW") -> list[str]:
        if yahoo:
            tmp = "yahoo_symbol"
        else:
            tmp = "symbol"

        column = getattr(StockDTO, tmp)

        stmt = select(column)
        stmt = stmt.where(StockDTO.active == True)

        if exchange != 'all':
            stmt = stmt.where(StockDTO.exchange == exchange)

        stmt = stmt.order_by(StockDTO.id)
        result = await self.session.scalars(stmt)

        return list(result.all())
    
    async def upsert(self,  stock_object: StockCreateDTO) -> StockDTO:
        payload = stock_object.model_dump()
        stmt = insert(StockCreateDTO).values(**payload)
        mapper = inspect(StockCreateDTO)

        columns = {
            col.name: getattr(stmt.excluded, col.name)
            for col in mapper.c
            if col.name != "symbol" and col.name != "id" and col.name != "yahoo_symbol"  
        }      
        
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=["symbol"],  
            set = columns
        )

        await self.execute(upsert_stmt)
        await self.commit()