from sqlalchemy import select

from db.models.stock import Stock
from db.models.stock_price import StockPrice
from db.repositories.base import AsyncRepository
from dto.stock_price import StockPriceCreateDTO, StockPriceDTO


class StockPriceRepository(
    AsyncRepository[StockPrice, StockPriceCreateDTO, StockPriceDTO]
):
    model = StockPrice
    output_schema = StockPriceDTO

    async def get_exchange_tickers(self, yahoo=True, exchange="GPW") -> list[str]:
        tmp = "yahoo_symbol" if yahoo else "symbol"

        stmt = select(tmp)
        stmt = stmt.where(Stock.active)

        if exchange != "all":
            stmt = stmt.where(Stock.exchange == exchange)

        stmt = stmt.order_by(Stock.id())

        result = await self.session.scalars(stmt)

        return list(result.all())
