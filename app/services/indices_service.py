from db.repositories.stock_exchange_index_rate import StockExchangeIndexRateRepository
from db.repositories.stock_index import StockIndexRepository
from dto.index_response import (
    IndexHistoryResponse,
    IndexOHLCVEntry,
    IndexResponse,
)
from services.period_utils import period_to_start_date


class IndicesService:
    def __init__(
        self,
        index_repo: StockIndexRepository,
        rate_repo: StockExchangeIndexRateRepository,
    ):
        self.index_repo = index_repo
        self.rate_repo = rate_repo

    async def get_all_indices(self) -> list[IndexResponse]:
        indexes = await self.index_repo.get_all_with_exchange()

        return [
            IndexResponse(
                id=idx.id,
                symbol=idx.symbol,
                name=idx.name,
                stock_exchange=idx.stock_exchange.symbol,
                active=idx.active,
            )
            for idx in indexes
        ]

    async def get_index_history(
        self, symbol: str, period: str = "1y"
    ) -> IndexHistoryResponse | None:
        indexes = await self.index_repo.get_all_with_exchange()
        index = None
        for idx in indexes:
            if idx.symbol == symbol:
                index = idx
                break

        if index is None:
            return None

        start_date = period_to_start_date(period)
        from datetime import date

        end_date = date.today()

        rates = await self.rate_repo.get_rates_for_period(
            index.id, start_date, end_date
        )

        data = [
            IndexOHLCVEntry(
                time=rate.trading_date,
                open=rate.open,
                high=rate.high,
                low=rate.low,
                close=rate.close,
                volume=int(rate.volume),
            )
            for rate in rates
        ]

        return IndexHistoryResponse(
            symbol=index.symbol,
            name=index.name,
            data=data,
        )
