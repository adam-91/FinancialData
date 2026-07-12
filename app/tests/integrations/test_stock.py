import pytest

@pytest.mark.asyncio
async def test_get_stock_exchange(
    db_session, stock_exchange_repo
):

    stocks = await stock_exchange_repo.get_exchange("GPW")

    assert stocks is not None
    assert stocks.symbol == "GPW"
    assert stocks.name == "Giełda Papierów Wartościowych w Warszawie"
    assert stocks.country == "POLAND"

@pytest.mark.asyncio
async def test_get_stock_exchange_index(
    db_session, stock_exchange_indexes_repo
):
    stocks = await stock_exchange_indexes_repo.get_exchange_index("^WIG20")

    assert stocks is not None
    assert stocks.symbol == "^WIG20"
    assert stocks.name == "Warszawski Indeks Giełdowy 20"
    assert stocks.exchange_symbol == "GPW"

@pytest.mark.asyncio
async def test_get_stock_exchange_indexes_for_stock_market(
    db_session, stock_exchange_indexes_repo
):
    indexes = await stock_exchange_indexes_repo.get_exchange_indexes(stock_exchange="GPW")

    assert len(indexes) == 3
    assert indexes[0].symbol == "^WIG20"
    assert indexes[1].symbol == "^WIG0"
    assert indexes[2].symbol == "^MWIG400"
    assert indexes[0].name == "Warszawski Indeks Giełdowy 20"
    assert indexes.exchange_symbol == "GPW"




