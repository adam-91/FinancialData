from sqlalchemy import func, insert, inspect, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import MultipleResultsFound, NoResultFound
from sqlalchemy.orm import joinedload

from db.models.stock_company import StockCompany
from db.models.stock_exchange import StockExchange
from db.models.stock_exchange_index import StockExchangeIndex
from db.models.stock_index_membership import StockIndexMembership
from db.repositories.base import AsyncRepository
from dto.stock_company_dto import StockCompanyCreateDTO, StockCompanyDTO


class StockCompanyRepository(
    AsyncRepository[StockCompany, StockCompanyCreateDTO, StockCompanyDTO]
):
    model = StockCompany
    output_schema = StockCompanyDTO

    async def get_exchange_tickers(
        self, yahoo=True, exchange: int | str = "GPW"
    ) -> list[str]:
        if yahoo:
            stmt = select(StockCompany.yahoo_symbol)
        else:
            select(StockCompany.symbol)

        stmt = stmt.where(StockCompany.active)

        if isinstance(exchange, int):
            stmt = stmt.where(StockCompany.stock_exchange_id == exchange)
        else:
            stmt = stmt.options(joinedload(StockExchange.name))
            stmt = stmt.where(StockExchange.name == exchange)

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
        self, yahoo_symbol: str
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
        self, stock_object: StockCompanyDTO | StockCompanyCreateDTO
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

        await self.session.execute(upsert_stmt)
        await self.session.commit()

    async def get_count(self) -> int:
        stmt = select(func.count()).select_from(StockCompany)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def bulk_upsert(self, companies: list[dict]) -> int:
        if not companies:
            return 0

        stmt = pg_insert(StockCompany).values(companies)
        update_dict = {
            c.name: stmt.excluded[c.name]
            for c in stmt.excluded
            if c.name not in ("id", "symbol", "yahoo_symbol")
        }
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=["yahoo_symbol"],
            set_=update_dict,
        )
        result = await self.session.execute(upsert_stmt)
        await self.session.commit()
        return result.rowcount

    async def get_by_exchange(self, exchange_symbol: str) -> list[StockCompanyDTO]:
        stmt = select(StockCompany)
        stmt = stmt.join(StockExchange)
        stmt = stmt.where(StockExchange.symbol == exchange_symbol)
        stmt = stmt.where(StockCompany.active)

        result = await self.session.execute(stmt)
        companies = result.scalars().all()

        return [StockCompanyDTO.model_validate(c) for c in companies]

    async def get_by_index(self, index_symbol: str) -> list[StockCompanyDTO]:
        stmt = select(StockCompany)
        stmt = stmt.join(
            StockIndexMembership,
            StockCompany.id == StockIndexMembership.company_id,
        )
        stmt = stmt.join(
            StockExchangeIndex,
            StockIndexMembership.index_id == StockExchangeIndex.id,
        )
        stmt = stmt.where(StockExchangeIndex.symbol == index_symbol)
        stmt = stmt.where(StockIndexMembership.active)
        stmt = stmt.where(StockCompany.active)

        result = await self.session.execute(stmt)
        companies = result.scalars().all()

        return [StockCompanyDTO.model_validate(c) for c in companies]
