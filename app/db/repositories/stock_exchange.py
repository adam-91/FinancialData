from sqlalchemy import insert, select

from db.models.stock_exchange import StockExchange
from db.repositories.base import AsyncRepository
from dto.stock_exchange_dto import StockExchangeCreateDTO, StockExchangeDTO


class StockExchangeRepository(
    AsyncRepository[StockExchange, StockExchangeCreateDTO, StockExchangeDTO]
):
    model = StockExchange
    output_schema = StockExchangeDTO

    async def get_exchange(
            self, 
            identyfier: int | str
            ) -> StockExchangeDTO | None:
        stmt = select(StockExchange)
        if isinstance(identyfier, int):
            stmt = stmt.where(StockExchange.id == identyfier)
        elif isinstance(identyfier, str):
            stmt = stmt.where(StockExchange.symbol == identyfier)

        result = await self.session.scalar(stmt)
    
        if not result:
            return None
        
        return StockExchangeDTO(
            id=result.id,
            symbol=result.symbol,
            name=result.name,
            country=result.country,
            active=result.active,
        )
    
    async def get_exchanges(
            self, 
            country: str | None = None
            ) -> list[StockExchangeDTO] | None:
        
        stmt = select(StockExchange)
        if country is not None:
            stmt = stmt.where(StockExchange.country == country)
        
        result =  await self.session.scalar(stmt)
        db_model = result.scalars().all()
    
        if not db_model:
            return None
        
        return [
            StockExchangeDTO.model_validate(item)
            for item in db_model
        ]
    
    async def add_exchanges(
            self, 
            stocks: list[StockExchangeCreateDTO]
            ) -> list[StockExchangeDTO] | None:
        
        result = await self.session.scalars(select(StockExchange.symbol))
        existing_symbols = set(result.all())
        new_exchanges_dicts = []

        for stock in stocks:
            symbol = stock.get("symbol")

            if symbol in existing_symbols:
                continue

            new_exchanges_dicts.append({
                "symbol": symbol,
                "name": stock.get("name"),
                "country": stock.get("country"),
                "ticker": stock.get("ticker"),
                "active": True
            })
                
        if new_exchanges_dicts:
            await self.session.execute(insert(StockExchange), new_exchanges_dicts)
            await self.session.commit()
            print(f"Added {len(new_exchanges_dicts)} of the new stock exchange markets")
            return new_exchanges_dicts
        else:
            print("No new stock exchange markets")
            return None
       
        return False