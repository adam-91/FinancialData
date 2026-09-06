from datetime import date
from types import SimpleNamespace

import pytest

from services.currency_analytics_service import CurrencyAnalyticsService


def _service(codes, mid_rows):
    ids = {code: i + 1 for i, code in enumerate(codes)}

    def _get_by_code_sync(code):
        if code in ids:
            return SimpleNamespace(id=ids[code], code=code, name=code)
        return None

    async def get_by_code(code):
        return _get_by_code_sync(code)

    async def get_rates_for_period(currency_id, start_date, end_date):
        return [r for r in mid_rows if r.currency_id == currency_id]

    return CurrencyAnalyticsService(
        SimpleNamespace(get_by_code=get_by_code),
        SimpleNamespace(get_rates_for_period=get_rates_for_period),
        SimpleNamespace(),
    )


def _mid(currency_id, day, mid):
    return SimpleNamespace(
        currency_id=currency_id,
        effective_date=date(2025, 1, day),
        mid=mid,
    )


@pytest.mark.asyncio
async def test_daily_change_computes_day_to_day_percent():
    service = _service(
        ["USD"],
        [
            _mid(1, 1, 4.0),
            _mid(1, 2, 4.1),
            _mid(1, 3, 4.05),
        ],
    )

    result = await service.get_daily_change(["USD"])

    assert len(result) == 1
    assert result[0].code == "USD"
    changes = [p.change for p in result[0].data]
    assert changes[0] == pytest.approx(2.5)
    assert changes[1] == pytest.approx(-1.2195, abs=1e-3)


@pytest.mark.asyncio
async def test_moving_average_computes_ma_and_trend():
    service = _service(
        ["USD"],
        [
            _mid(1, 1, 4.0),
            _mid(1, 2, 4.2),
            _mid(1, 3, 4.4),
        ],
    )

    result = await service.get_moving_average(["USD"], window=2)

    assert len(result) == 1
    item = result[0]
    assert item.data[0].ma is None
    assert item.data[1].ma == pytest.approx(4.1)
    assert item.data[2].ma == pytest.approx(4.3)
    assert item.trend.direction == "up"
    assert item.trend.percent == pytest.approx(4.878, abs=1e-2)


@pytest.mark.asyncio
async def test_correlation_single_currency_uses_eur_reference():
    service = _service(
        ["GBP", "EUR"],
        [
            _mid(1, 1, 5.0),
            _mid(1, 2, 5.1),
            _mid(1, 3, 5.2),
            _mid(2, 1, 4.5),
            _mid(2, 2, 4.4),
            _mid(2, 3, 4.6),
        ],
    )

    result = await service.get_correlation(["GBP"])

    assert result.codes == ["GBP", "EUR"]
    assert len(result.values) == 2
    assert result.values[0][0] == pytest.approx(1.0)
    assert result.values[1][1] == pytest.approx(1.0)


@pytest.mark.asyncio
async def test_correlation_eur_uses_usd_reference():
    service = _service(
        ["EUR", "USD"],
        [
            _mid(1, 1, 4.5),
            _mid(1, 2, 4.4),
            _mid(1, 3, 4.6),
            _mid(2, 1, 4.0),
            _mid(2, 2, 4.1),
            _mid(2, 3, 4.05),
        ],
    )

    result = await service.get_correlation(["EUR"])

    assert result.codes == ["EUR", "USD"]
