from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.stock_company import StockCompany
from db.models.stock_exchange import StockExchange
from db.models.stock_exchange_index import StockExchangeIndex
from db.repositories.stock_company import StockCompanyRepository
from db.repositories.stock_exchange import StockExchangeRepository
from db.repositories.stock_exchange_index import StockExchangeIndexRepository
from dto.admin_ticker_dto import IndexCreateDTO, TickerCreateDTO
from integrations.yfinance.client import YahooFinanceClient


class TickerAdminService:
    def __init__(
        self,
        session: AsyncSession,
        yf_client: YahooFinanceClient | None = None,
    ):
        self.session = session
        self.company_repo = StockCompanyRepository(session)
        self.index_repo = StockExchangeIndexRepository(session)
        self.exchange_repo = StockExchangeRepository(session)
        self.yf_client = yf_client or YahooFinanceClient()

    async def list_companies(self) -> list[StockCompany]:
        return await self.company_repo.get_all()

    async def list_indices(self) -> list[StockExchangeIndex]:
        return await self.index_repo.get_all()

    async def list_exchanges(self) -> list[StockExchange]:
        return await self.exchange_repo.get_all()

    async def test_symbol(self, symbol: str) -> dict:
        return await self.yf_client.check_symbol(symbol)

    async def create_company(
        self, dto: TickerCreateDTO, force: bool = False
    ) -> StockCompany:
        exchange = await self._get_exchange(dto.exchange_symbol)
        yahoo_symbol = dto.yahoo_symbol or self._build_yahoo_symbol(
            dto.symbol, exchange
        )

        await self._validate_symbol(yahoo_symbol, force)

        existing = await self.company_repo.get_by_yahoo_symbol(yahoo_symbol)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Company with yahoo_symbol '{yahoo_symbol}' already exists",
            )

        company = await self.company_repo.create_company(
            symbol=dto.symbol,
            yahoo_symbol=yahoo_symbol,
            name=dto.name,
            exchange_id=exchange.id,
            active=True,
        )
        await self.company_repo.save()
        return company

    async def create_index(
        self, dto: IndexCreateDTO, force: bool = False
    ) -> StockExchangeIndex:
        exchange = await self._get_exchange(dto.exchange_symbol)

        await self._validate_symbol(dto.symbol, force)

        existing = await self.index_repo.get_model_by_symbol(dto.symbol)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Index with symbol '{dto.symbol}' already exists",
            )

        index = await self.index_repo.create_index(
            symbol=dto.symbol,
            name=dto.name,
            exchange_id=exchange.id,
            active=True,
        )
        await self.index_repo.save()
        return index

    async def _get_exchange(self, exchange_symbol: str) -> StockExchange:
        exchanges = await self.exchange_repo.get_all()
        for exchange in exchanges:
            if exchange.symbol == exchange_symbol:
                return exchange

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exchange not found: {exchange_symbol}",
        )

    async def _validate_symbol(self, symbol: str, force: bool) -> None:
        if force:
            return

        result = await self.yf_client.check_symbol(symbol)
        if not result.get("found"):
            error = result.get("error")
            detail = (
                f"yFinance does not recognize symbol '{symbol}'"
                + (f": {error}" if error else "")
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail,
            )

    @staticmethod
    def _build_yahoo_symbol(symbol: str, exchange: StockExchange) -> str:
        ticker = getattr(exchange, "ticker", None)
        if ticker:
            return f"{symbol}.{ticker}"
        return symbol
