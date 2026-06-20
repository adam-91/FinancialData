import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
async def test_get_exchange_tickers_non_yahoo_single_exchange(
    db_session, stock_repo, stock_data
):

    tickers = await stock_repo.get_exchange_tickers(yahoo=False, exchange="GPW")

    assert len(tickers) == 2
    assert tickers == ["PKN", "KGH"]


@pytest.mark.asyncio
async def test_get_exchange_tickers_single_exchange(db_session, stock_repo, stock_data):
    tickers = await stock_repo.get_exchange_tickers(exchange="GPW")

    assert len(tickers) == 2
    assert tickers == ["PKN.WA", "KGH.WA"]


@pytest.mark.asyncio
async def test_get_exchange_tickers_no_yahoo_multiple_exchange(
    async_engine, stock_repo, stock_data
):
    tickers = await stock_repo.get_exchange_tickers(yahoo=False, exchange="all")

    assert len(tickers) == 3
    assert tickers == ["PKN", "KGH", "MSFT"]


@pytest.mark.asyncio
async def test_get_exchange_tickers_multiple_exchange(
    async_engine, stock_repo, stock_data
):
    tickers = await stock_repo.get_exchange_tickers(yahoo=True, exchange="all")

    assert len(tickers) == 3
    assert tickers == ["PKN.WA", "KGH.WA", "MSFT"]
