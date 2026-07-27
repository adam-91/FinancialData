from datetime import date

from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_price import StockPriceRepository
from dto.stock_price_dto import StockPriceFullDTO


class StockExchangeService:
    def __init__(
        self,
        stock_repo: StockCompanyRepository,
        stock_price_repo: StockPriceRepository,
    ):
        self.stock_repo = stock_repo
        self.stock_price_repo = stock_price_repo


    async def get_exchange_price(
        self,
        exchange: str,
        date: date | None = None,
    ) -> list[StockPriceFullDTO]:
        
        exchanges = await self.stock_repo.get_exchange_tickers()
        stock_rates = []
        for ticker in exchanges:
            stock_rate = await self.stock_price_repo.get_stock_price(ticker,date,False)
            stock_rates.append(stock_rate)
        
        if stock_rate is None:
            raise ValueError(f"Stock price {exchange} for {date} is not exist") 
        
        return stock_rate
    
    async def get_stock_price(
        self,
        identyfier: str | int,
        date: date | None = None,
        yahoo: bool = False
    ) -> StockPriceFullDTO:
        
        if isinstance(identyfier, str):
            stock_rate = await self.stock_price_repo.get_stock_price_by_symbol(
                identyfier,
                date,
                yahoo,
                True
                )
        else:
            stock_rate = await self.stock_price_repo.get_stock_price(
                identyfier,
                date,
                True)
        
        if stock_rate is None:
            raise ValueError(f"Stock price {identyfier} for {date} is not exist") 
        
        return stock_rate
