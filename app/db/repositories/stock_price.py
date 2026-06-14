from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dto.stock_price import StockPriceCreateDTO, StockPriceDTO
from db.models.stock import Stock
from db.models.stock_price import StockPrice
from db.repositories.base import AsyncRepository


class StockPriceRepository(AsyncRepository[StockPrice,StockPriceCreateDTO,StockPriceDTO]):
    model = StockPrice
    output_schema = StockPriceDTO

    async def get_exchange_tickers(self, yahoo = True,exchange="GPW") -> list[str]:
        if yahoo:
            tmp = "yahoo_symbol"
        else:
            tmp = "symbol"

        #column = getattr(Stock, tmp)

        stmt = select(tmp)
        stmt = stmt.where(Stock.active == True)

        if exchange != 'all':
            stmt = stmt.where(Stock.exchange == exchange)

        stmt = stmt.order_by(Stock.id())


        result = await self.session.scalars(stmt)

        return list(result.all())

 