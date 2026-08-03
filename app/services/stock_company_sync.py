import json
import structlog
from pathlib import Path

import yaml
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from db.database import AsyncSessionFactory
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_exchange import StockExchangeRepository
from db.repositories.stock_index import StockIndexRepository
from dto.stock_company_dto import StockCompanyCreateDTO, StockCompanyDTO

logger = structlog.get_logger()


class StockCompanySyncService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.company_repo = StockCompanyRepository(session)
        self.exchange_repo = StockExchangeRepository(session)
        self.index_repo = StockIndexRepository(session)

    async def sync_from_json_file(self, file_path: str) -> int:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        logger.info("Loading stock companies from JSON file", file_path=file_path)

        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        return await self._process_companies_data(data)

    async def sync_from_yaml_file(self, file_path: str) -> int:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        logger.info("Loading stock companies from YAML file", file_path=file_path)

        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)

        if isinstance(data, dict) and "companies" in data:
            data = data["companies"]

        return await self._process_companies_data(data)

    async def _process_companies_data(self, data: list[dict]) -> int:
        exchange_cache = {}
        companies_to_insert = []

        for item in data:
            exchange_symbol = item.get("exchange")
            if not exchange_symbol:
                continue

            if exchange_symbol not in exchange_cache:
                exchange = await self.exchange_repo.get_exchange(exchange_symbol)
                if exchange is None:
                    logger.warning(
                        "Exchange not found",
                        exchange_symbol=exchange_symbol,
                    )
                    continue
                exchange_cache[exchange_symbol] = exchange.id

            exchange_id = exchange_cache[exchange_symbol]

            companies_to_insert.append(
                {
                    "symbol": item.get("symbol"),
                    "yahoo_symbol": item.get("yahoo_symbol"),
                    "name": item.get("name", ""),
                    "exchange_id": exchange_id,
                    "active": item.get("active", True),
                }
            )

        if companies_to_insert:
            count = await self.company_repo.bulk_upsert(companies_to_insert)
            logger.info("Processed stock companies", count=count)
            return count

        logger.info("No new stock companies to process")
        return 0

    async def add_single_company(self, data: dict) -> StockCompanyDTO:
        exchange_symbol = data.get("exchange")
        exchange = await self.exchange_repo.get_exchange(exchange_symbol)
        if exchange is None:
            raise ValueError(f"Exchange not found: {exchange_symbol}")

        dto = StockCompanyCreateDTO(
            symbol=data.get("symbol"),
            yahoo_symbol=data.get("yahoo_symbol"),
            name=data.get("name", ""),
            stock_exchange_id=exchange.id,
            active=data.get("active", True),
        )

        return await self.company_repo.create(dto)

    async def sync_if_needed(self) -> bool:
        count = await self.company_repo.get_count()
        if count >= settings.STOCK_COMPANIES_MIN_THRESHOLD:
            logger.info("Stock companies sync not needed", current_count=count)
            return False

        default_file = settings.STOCK_COMPANIES_DEFAULT_FILE
        if default_file and Path(default_file).exists():
            logger.info("Stock companies sync needed", current_count=count)
            await self.sync_from_json_file(default_file)
            return True

        logger.warning(
            "No default stock companies file found",
            default_file=default_file,
        )
        return False

    async def add_companies_to_index(
        self, index_symbol: str, company_symbols: list[str]
    ) -> int:
        index = await self.index_repo.get_exchange_index(index_symbol)
        if index is None:
            raise ValueError(f"Index not found: {index_symbol}")

        company_ids = []
        for symbol in company_symbols:
            company = await self.company_repo.get_stock_instance_by_yahoo_symbol(symbol)
            if company:
                company_ids.append(company.id)

        if company_ids:
            return await self.index_repo.add_companies_to_index(index.id, company_ids)

        return 0

    async def remove_companies_from_index(
        self, index_symbol: str, company_symbols: list[str]
    ) -> int:
        index = await self.index_repo.get_exchange_index(index_symbol)
        if index is None:
            raise ValueError(f"Index not found: {index_symbol}")

        company_ids = []
        for symbol in company_symbols:
            company = await self.company_repo.get_stock_instance_by_yahoo_symbol(symbol)
            if company:
                company_ids.append(company.id)

        if company_ids:
            return await self.index_repo.remove_companies_from_index(
                index.id, company_ids
            )

        return 0

    async def get_companies_by_index(self, index_symbol: str) -> list[StockCompanyDTO]:
        return await self.company_repo.get_by_index(index_symbol)

    async def get_companies_by_exchange(
        self, exchange_symbol: str
    ) -> list[StockCompanyDTO]:
        return await self.company_repo.get_by_exchange(exchange_symbol)


async def sync_stock_companies_if_needed() -> None:
    logger.info("Starting stock companies sync check")
    async with AsyncSessionFactory() as session:
        service = StockCompanySyncService(session)
        await service.sync_if_needed()
