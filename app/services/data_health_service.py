from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_exchange_index_rate import StockExchangeIndexRateRepository
from db.repositories.stock_index import StockIndexRepository
from db.repositories.stock_price import StockPriceRepository
from dto.data_health_dto import (
    DataHealthSummary,
    EntityHealthDetail,
    RawDataEntry,
    RawDataResponse,
)


class DataHealthService:
    def __init__(
        self,
        index_repo: StockIndexRepository,
        index_rate_repo: StockExchangeIndexRateRepository,
        company_repo: StockCompanyRepository,
        price_repo: StockPriceRepository,
    ):
        self.index_repo = index_repo
        self.index_rate_repo = index_rate_repo
        self.company_repo = company_repo
        self.price_repo = price_repo

    async def get_summary(self) -> DataHealthSummary:
        indexes_summary = await self.index_rate_repo.get_all_indexes_data_summary()
        companies_summary = await self.price_repo.get_all_companies_data_summary()

        total_indices = len(indexes_summary)
        indices_with_data = sum(1 for idx in indexes_summary if idx["count"] > 0)

        total_companies = len(companies_summary)
        companies_with_data = sum(1 for comp in companies_summary if comp["count"] > 0)

        indices_percent = (
            (indices_with_data / total_indices * 100) if total_indices > 0 else 0.0
        )
        companies_percent = (
            (companies_with_data / total_companies * 100)
            if total_companies > 0
            else 0.0
        )

        return DataHealthSummary(
            total_indices=total_indices,
            indices_with_data=indices_with_data,
            indices_percent=round(indices_percent, 2),
            total_companies=total_companies,
            companies_with_data=companies_with_data,
            companies_percent=round(companies_percent, 2),
        )

    async def get_index_detail(self, symbol: str) -> EntityHealthDetail | None:
        indexes = await self.index_repo.get_all_with_exchange()
        index = None
        for idx in indexes:
            if idx.symbol == symbol:
                index = idx
                break

        if index is None:
            return None

        data_range = await self.index_rate_repo.get_data_range_by_index(index.id)

        if data_range is None:
            return EntityHealthDetail(
                symbol=symbol,
                name=index.name,
                min_date=None,
                max_date=None,
                record_count=0,
            )

        return EntityHealthDetail(
            symbol=symbol,
            name=index.name,
            min_date=data_range["min_date"],
            max_date=data_range["max_date"],
            record_count=data_range["count"],
        )

    async def get_company_detail(self, symbol: str) -> EntityHealthDetail | None:
        companies = await self.company_repo.get_all()
        company = None
        for comp in companies:
            if comp.symbol == symbol:
                company = comp
                break

        if company is None:
            return None

        data_range = await self.price_repo.get_data_range_by_company(company.id)

        if data_range is None:
            return EntityHealthDetail(
                symbol=symbol,
                name=company.name,
                min_date=None,
                max_date=None,
                record_count=0,
            )

        return EntityHealthDetail(
            symbol=symbol,
            name=company.name,
            min_date=data_range["min_date"],
            max_date=data_range["max_date"],
            record_count=data_range["count"],
        )

    async def get_raw_data(
        self, entity_type: str, symbol: str, page: int = 1, page_size: int = 50
    ) -> RawDataResponse | None:
        if entity_type == "index":
            return await self._get_index_raw_data(symbol, page, page_size)
        elif entity_type == "company":
            return await self._get_company_raw_data(symbol, page, page_size)
        else:
            return None

    async def _get_index_raw_data(
        self, symbol: str, page: int, page_size: int
    ) -> RawDataResponse | None:
        indexes = await self.index_repo.get_all_with_exchange()
        index = None
        for idx in indexes:
            if idx.symbol == symbol:
                index = idx
                break

        if index is None:
            return None

        rates, total = await self.index_rate_repo.get_rates_paginated(
            index.id, page, page_size
        )

        data = [
            RawDataEntry(
                trading_date=rate.trading_date,
                open=rate.open,
                high=rate.high,
                low=rate.low,
                close=rate.close,
                volume=int(rate.volume),
            )
            for rate in rates
        ]

        return RawDataResponse(
            symbol=symbol,
            name=index.name,
            total=total,
            page=page,
            page_size=page_size,
            data=data,
        )

    async def _get_company_raw_data(
        self, symbol: str, page: int, page_size: int
    ) -> RawDataResponse | None:
        companies = await self.company_repo.get_all()
        company = None
        for comp in companies:
            if comp.symbol == symbol:
                company = comp
                break

        if company is None:
            return None

        prices, total = await self.price_repo.get_prices_paginated(
            company.id, page, page_size
        )

        data = [
            RawDataEntry(
                trading_date=price.trading_date,
                open=price.open,
                high=price.high,
                low=price.low,
                close=price.close,
                volume=int(price.volume),
            )
            for price in prices
        ]

        return RawDataResponse(
            symbol=symbol,
            name=company.name,
            total=total,
            page=page,
            page_size=page_size,
            data=data,
        )
