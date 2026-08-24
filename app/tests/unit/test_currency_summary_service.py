from datetime import date
from types import SimpleNamespace

import pytest

from services.currency_summary_service import CurrencySummaryService


def _currency(code: str, name: str) -> SimpleNamespace:
    return SimpleNamespace(code=code, name=name)


def _mid_row(code: str, day: int, mid: float) -> SimpleNamespace:
    return SimpleNamespace(
        currency=SimpleNamespace(code=code),
        effective_date=date(2025, 1, day),
        mid=mid,
    )


def _bs_row(code: str, day: int, bid: float, ask: float) -> SimpleNamespace:
    return SimpleNamespace(
        currency=SimpleNamespace(code=code),
        effective_date=date(2025, 1, day),
        bid=bid,
        ask=ask,
    )


def _service(currencies, mid_rows, bs_rows) -> CurrencySummaryService:
    return CurrencySummaryService(
        SimpleNamespace(get_all=_async_return(currencies)),
        SimpleNamespace(get_all_with_currency=_async_return(mid_rows)),
        SimpleNamespace(get_all_with_currency=_async_return(bs_rows)),
    )


def _async_return(value):
    async def _fn():
        return value

    return _fn


@pytest.mark.asyncio
async def test_summary_computes_change_from_mid():
    service = _service(
        [_currency("USD", "Dolar amerykański"), _currency("EUR", "Euro")],
        [
            _mid_row("USD", 1, 4.0),
            _mid_row("USD", 2, 4.1),
            _mid_row("EUR", 1, 4.5),
            _mid_row("EUR", 2, 4.4),
        ],
        [
            _bs_row("USD", 2, 4.05, 4.15),
            _bs_row("EUR", 2, 4.35, 4.45),
        ],
    )

    result = await service.get_summary()

    by_code = {item.code: item for item in result}

    assert by_code["USD"].change == pytest.approx(2.5)
    assert by_code["EUR"].change == pytest.approx(-2.2222, abs=1e-3)
    assert float(by_code["USD"].mid) == 4.1
    assert by_code["USD"].bid is not None
    assert by_code["USD"].ask is not None


@pytest.mark.asyncio
async def test_summary_falls_back_to_buy_sell_average():
    service = _service(
        [_currency("CHF", "Frank szwajcarski")],
        [],
        [
            _bs_row("CHF", 1, 4.0, 4.2),
            _bs_row("CHF", 2, 4.1, 4.3),
        ],
    )

    result = await service.get_summary()

    assert len(result) == 1
    item = result[0]
    assert item.mid is None
    assert item.change == pytest.approx(2.439, abs=1e-3)


@pytest.mark.asyncio
async def test_summary_change_none_for_single_rate():
    service = _service(
        [_currency("USD", "Dolar amerykański")],
        [_mid_row("USD", 1, 4.0)],
        [],
    )

    result = await service.get_summary()

    assert result[0].change is None
    assert float(result[0].mid) == 4.0
