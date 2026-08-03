from datetime import date, timedelta


def period_to_start_date(period: str) -> date:
    today = date.today()

    match period:
        case "1w":
            return today - timedelta(weeks=1)
        case "3m":
            return today - timedelta(days=90)
        case "1y":
            return today - timedelta(days=365)
        case "3y":
            return today - timedelta(days=1095)
        case "10y":
            return today - timedelta(days=3650)
        case "max":
            return date(1990, 1, 1)
        case _:
            return today - timedelta(days=365)
