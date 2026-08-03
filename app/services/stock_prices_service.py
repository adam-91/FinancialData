from datetime import date
from decimal import Decimal

from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_price import StockPriceRepository
from dto.stock_price_response import (
    StockHistoryResponse,
    StockOHLCVEntry,
    StockPriceInfo,
    StockWithPriceResponse,
)
from services.period_utils import period_to_start_date


class StockPricesService:
    def __init__(
        self,
        company_repo: StockCompanyRepository,
        price_repo: StockPriceRepository,
    ):
        self.company_repo = company_repo
        self.price_repo = price_repo

    async def get_all_prices(self) -> list[StockWithPriceResponse]:
        rows = await self.price_repo.get_all_latest_prices()

        result = []
        for company, price in rows:
            prev_close = price.open
            change = price.close - prev_close
            if prev_close != 0:
                change_percent = (change / prev_close) * Decimal("100")
            else:
                change_percent = Decimal("0")

            index_symbols = []
            if hasattr(company, "stock_index_memberships"):
                for membership in company.stock_index_memberships:
                    if membership.active and membership.stock_index:
                        index_symbols.append(membership.stock_index.symbol)

            price_info = StockPriceInfo(
                trading_date=price.trading_date,
                open=price.open,
                high=price.high,
                low=price.low,
                close=price.close,
                volume=int(price.volume),
                change=round(change, 2),
                change_percent=round(change_percent, 2),
            )

            result.append(
                StockWithPriceResponse(
                    symbol=company.symbol,
                    yahoo_symbol=company.yahoo_symbol,
                    name=company.name,
                    stock_exchange=company.stock_exchange.symbol,
                    indices=index_symbols,
                    price=price_info,
                )
            )

        return result

    async def get_stock_history(
        self, symbol: str, period: str = "1y"
    ) -> StockHistoryResponse | None:
        companies = await self.company_repo.get_all()
        company = None
        for c in companies:
            if c.symbol == symbol:
                company = c
                break

        if company is None:
            return None

        start_date = period_to_start_date(period)
        end_date = date.today()

        prices = await self.price_repo.get_prices_for_period(
            company.id, start_date, end_date
        )

        data = [
            StockOHLCVEntry(
                time=price.trading_date,
                open=price.open,
                high=price.high,
                low=price.low,
                close=price.close,
                volume=int(price.volume),
            )
            for price in prices
        ]

        return StockHistoryResponse(
            symbol=company.symbol,
            name=company.name,
            data=data,
        )
