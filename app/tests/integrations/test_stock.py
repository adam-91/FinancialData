import pytest
from db.repositories.stock import StockRepository

@pytest.mark.asyncio
async def get_exchange_tickers_non_yahoo_single_exchange(session,stock_repo,stock_factory):
    session.add_all([
        stock_factory(
            symbol="PKN",
            yahoo_symbol="PKN.WA",
            name="Orlen S.A",
            exchange="GPW",
            active=True,
        ),
        stock_factory(
            symbol="KGH",
            yahoo_symbol="KGH.WA",
            name="KGHM Polska Miedź S.A.",
            exchange="GPW",
            active=True,
        ),
        stock_factory(
            symbol="ABCT",
            yahoo_symbol="ABCT.WA",
            name="ABC Data S.A. / Asseco BS",
            exchange="GPW",
            active=False,
        ),
        stock_factory(
            symbol="MSFT",
            yahoo_symbol="MSFT",
            name="Microsoft Corporation",
            exchange="NYSE",
            active=True,
        )
    ])

    await session.commit()

    tickers = await stock_repo.get_exchange_tickers(yahoo=False,exchange="GPW")

    assert len(tickers) == 2
    assert tickers == ["PKN", "KGH"]

async def get_exchange_tickers_single_exchange(session,stock_repo,stock_factory):
    tickers = await stock_repo.get_exchange_tickers(exchange="GPW")

    assert len(tickers) == 2
    assert tickers == ["PKN.WA", "KGH.WA"]

@pytest.mark.asyncio
async def get_exchange_tickers_no_yahoo_multiple_exchange(session,stock_repo,stock_factory):
    tickers = await stock_repo.get_exchange_all_tickers(yahoo=False,exchange="all")

    assert len(tickers) == 3
    assert tickers == ["PKN", "KGH", "MSFT"]

@pytest.mark.asyncio
async def get_exchange_tickers_multiple_exchange(session,stock_repo,stock_factory):
    tickers = await stock_repo.get_exchange_all_tickers(yahoo=False,exchange="all")

    assert len(tickers) == 3
    assert tickers == ["PKN.WA", "KGH.WA", "MSFT"]


