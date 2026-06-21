from sqlalchemy import insert, inspect, select
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from db.models.stock_company import StockCompany
from db.repositories.base import AsyncRepository
from dto.stock_company import StockCompanyCreateDTO, StockCompanyDTO


class StockCompanyRepository(AsyncRepository[
    StockCompany, 
    StockCompanyCreateDTO,
    StockCompanyDTO
    ]):
    model = StockCompany
    output_schema = StockCompanyDTO

    async def get_exchange_tickers(self, yahoo=True, exchange="GPW") -> list[str]:
        if yahoo:
            stmt = select(StockCompany.yahoo_symbol)  
        else:
            select(StockCompany.symbol)

        stmt = stmt.where(StockCompany.active)

        if exchange != "all":
            stmt = stmt.where(StockCompany.exchange == exchange)

        stmt = stmt.order_by(StockCompany.id)
        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    async def get_stock_instance_by_symbol(self, symbol: str) -> StockCompanyDTO:

        stmt = select(StockCompany)
        stmt = stmt.where(StockCompany.active)
        stmt = stmt.where(StockCompany.symbol == symbol)

        result = await self.session.execute(stmt)

        try:
            stock_model = result.scalar_one()
        except (NoResultFound, MultipleResultsFound) as err:
            raise ValueError(
                f"Stock instance with symbol {symbol} not found or duplicated."
            ) from err

        return StockCompanyDTO.model_validate(stock_model)

    async def get_stock_instance_by_yahoo_symbol(
            self, 
            yahoo_symbol: str
            ) -> StockCompanyDTO:

        stmt = select(StockCompany)
        stmt = stmt.where(StockCompany.active)
        stmt = stmt.where(StockCompany.yahoo_symbol == yahoo_symbol)

        result = await self.session.execute(stmt)

        try:
            stock_model = result.scalar_one()
        except (NoResultFound, MultipleResultsFound) as err:
            raise ValueError(
                f"""Stock instance with yahoo symbol {yahoo_symbol} 
                not found or duplicated."""
            ) from err

        return StockCompanyDTO.model_validate(stock_model)

    async def upsert(
            self, 
            stock_object: StockCompanyDTO | StockCompanyCreateDTO
            ) -> StockCompanyDTO:
        payload = stock_object.model_dump()

        if StockCompanyDTO(stock_object, StockCompanyDTO):
            stmt = insert(StockCompanyDTO).values(**payload)
            mapper = inspect(StockCompanyDTO)
        else:
            stmt = insert(StockCompanyCreateDTO).values(**payload)
            mapper = inspect(StockCompanyCreateDTO)

        columns = {
            col.name: getattr(stmt.excluded, col.name)
            for col in mapper.c
            if col.name != "symbol" and col.name != "id" and col.name != "yahoo_symbol"
        }

        upsert_stmt = stmt.on_conflict_do_update(index_elements=["symbol"], set=columns)

        await self.execute(upsert_stmt)
        await self.commit()
