from sqlalchemy import insert, inspect, select
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from db.models.stock import Stock
from db.repositories.base import AsyncRepository
from dto.stock import StockCreateDTO, StockDTO


class StockRepository(AsyncRepository[Stock, StockCreateDTO, StockDTO]):
    model = Stock
    output_schema = StockDTO

    async def get_exchange_tickers(self, yahoo=True, exchange="GPW") -> list[str]:
        stmt = select(Stock.yahoo_symbol) if yahoo else select(Stock.symbol)

        stmt = stmt.where(Stock.active)

        if exchange != "all":
            stmt = stmt.where(Stock.exchange == exchange)

        stmt = stmt.order_by(Stock.id)
        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    async def get_stock_instance_by_symbol(self, symbol: str) -> StockDTO:

        stmt = select(Stock)
        stmt = stmt.where(Stock.active)
        stmt = stmt.where(Stock.symbol == symbol)

        result = await self.session.execute(stmt)

        try:
            stock_model = result.scalar_one()
        except (NoResultFound, MultipleResultsFound) as err:
            raise ValueError(
                f"Stock instance with symbol {symbol} not found or duplicated."
            ) from err

        return StockDTO.model_validate(stock_model)

    async def get_stock_instance_by_yahoo_symbol(self, yahoo_symbol: str) -> StockDTO:

        stmt = select(Stock)
        stmt = stmt.where(Stock.active)
        stmt = stmt.where(Stock.yahoo_symbol == yahoo_symbol)

        result = await self.session.execute(stmt)

        try:
            stock_model = result.scalar_one()
        except (NoResultFound, MultipleResultsFound) as err:
            raise ValueError(
                f"""Stock instance with yahoo symbol {yahoo_symbol} 
                not found or duplicated."""
            ) from err

        return StockDTO.model_validate(stock_model)

    async def upsert(self, stock_object: StockDTO | StockCreateDTO) -> StockDTO:
        payload = stock_object.model_dump()

        if StockDTO(stock_object, StockDTO):
            stmt = insert(StockDTO).values(**payload)
            mapper = inspect(StockDTO)
        else:
            stmt = insert(StockCreateDTO).values(**payload)
            mapper = inspect(StockCreateDTO)

        columns = {
            col.name: getattr(stmt.excluded, col.name)
            for col in mapper.c
            if col.name != "symbol" and col.name != "id" and col.name != "yahoo_symbol"
        }

        upsert_stmt = stmt.on_conflict_do_update(index_elements=["symbol"], set=columns)

        await self.execute(upsert_stmt)
        await self.commit()
