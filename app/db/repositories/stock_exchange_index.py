import structlog

from sqlalchemy import insert, select

from db.models.stock_exchange import StockExchange
from db.models.stock_exchange_index import StockExchangeIndex
from db.repositories.base import AsyncRepository
from dto.stock_exchange_dto import StockExchangeIndexCreateDTO, StockExchangeIndexDTO

logger = structlog.get_logger()


class StockExchangeIndexRepository(
    AsyncRepository[
        StockExchangeIndex, StockExchangeIndexCreateDTO, StockExchangeIndexDTO
    ]
):
    model = StockExchangeIndex
    output_schema = StockExchangeIndexDTO

    async def get_exchange_index(
        self, identyfier: int | str
    ) -> StockExchangeIndexDTO | None:
        stmt = select(StockExchangeIndex)
        if isinstance(identyfier, int):
            stmt = stmt.where(StockExchangeIndex.id == identyfier)
        elif isinstance(identyfier, str):
            stmt = stmt.where(StockExchangeIndex.symbol == identyfier)

        db_model = await self.session.scalar(stmt)

        if not db_model:
            return None

        return StockExchangeIndexDTO.model_validate(db_model)

    async def get_exchange_indexes(
        self, stock_exchange: str | None = None
    ) -> list[StockExchangeIndexDTO] | None:

        stmt = select(StockExchangeIndex)
        if isinstance(stock_exchange, int):
            stmt = stmt.where(StockExchangeIndex.stock_exchange_id == stock_exchange)
        elif isinstance(stock_exchange, str):
            stmt = stmt.join(StockExchangeIndex.stock_exchange)
            stmt = stmt.where(StockExchange.name == stock_exchange)
        result = await self.session.scalars(stmt)
        db_models = result.all()

        if not db_models:
            return None

        return [
            StockExchangeIndexDTO(
                id=item.id,
                symbol=item.symbol,
                name=item.name,
                active=item.active,
                stock_exchange_id=item.stock_exchange_id,
            )
            for item in db_models
        ]

    async def add_exchange_indexes(
        self, indexes: list[StockExchangeIndexCreateDTO]
    ) -> list[StockExchangeIndexDTO] | None:
        existing_symbols = await self.session.execute(select(StockExchangeIndex.symbol))
        existing_symbols = {row[0] for row in existing_symbols}
        indexes_values = {
            item["exchange_symbol"] for item in indexes if "exchange_symbol" in item
        }
        stmt = select(StockExchange.symbol, StockExchange.id)
        stmt = stmt.where(StockExchange.symbol.in_(indexes_values))
        result = await self.session.execute(stmt)
        lookup_dict = {symbol: l_id for symbol, l_id in result.all()}

        new_indexes_dicts = []

        for stock in indexes:
            symbol = stock.get("symbol")

            if symbol in existing_symbols:
                continue

            stock_exchange_id = lookup_dict.get(stock.get("exchange_symbol"))
            if stock_exchange_id is None:
                continue

            new_indexes_dicts.append(
                {
                    "symbol": symbol,
                    "name": stock.get("name"),
                    "stock_exchange_id": stock_exchange_id,
                    "active": True,
                }
            )

        if new_indexes_dicts:
            await self.session.execute(insert(StockExchangeIndex), new_indexes_dicts)
            await self.session.commit()
            logger.info(
                "Added new stock exchange indexes",
                count=len(new_indexes_dicts),
            )
        else:
            logger.info("No new stock exchange indexes to add")

        return False
