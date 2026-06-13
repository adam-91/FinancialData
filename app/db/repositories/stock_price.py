from sqlalchemy import select
from db.models.stock import Stock
from db.models.stock_price import StockPrice
from db.repositories.base import AsyncRepository


class StockRepository(AsyncRepository):
    model = Stock

    async def get_exchange_tickers(self, yahoo = True,exchange="GPW") -> list[str]:
        if yahoo:
            tmp = "yahoo_symbol"
        else:
            tmp = "symbol"

        column = getattr(Stock, tmp)

        stmt = select(column)
        stmt = stmt.where(Stock.active == True)

        if exchange != 'all':
            stmt = stmt.where(Stock.exchange == exchange)

        stmt = stmt.order_by(Stock.id())


        result = await self.session.scalars(stmt)

        return list(result.all())

class StockPriceRepository(AsyncRepository):
    model = StockPrice
