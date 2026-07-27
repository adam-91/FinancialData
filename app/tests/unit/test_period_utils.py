from datetime import date, timedelta

from services.period_utils import period_to_start_date


def test_period_1w():
    result = period_to_start_date("1w")
    expected = date.today() - timedelta(weeks=1)
    assert result == expected


def test_period_3m():
    result = period_to_start_date("3m")
    expected = date.today() - timedelta(days=90)
    assert result == expected


def test_period_1y():
    result = period_to_start_date("1y")
    expected = date.today() - timedelta(days=365)
    assert result == expected


def test_period_3y():
    result = period_to_start_date("3y")
    expected = date.today() - timedelta(days=1095)
    assert result == expected


def test_period_10y():
    result = period_to_start_date("10y")
    expected = date.today() - timedelta(days=3650)
    assert result == expected


def test_period_max():
    result = period_to_start_date("max")
    assert result == date(1990, 1, 1)


def test_period_unknown_defaults_to_1y():
    result = period_to_start_date("invalid")
    expected = date.today() - timedelta(days=365)
    assert result == expected
