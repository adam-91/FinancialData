from datetime import date
from decimal import Decimal
from sqlalchemy import ForeignKey, Numeric,Date, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column 
from db.database import Base

class ExchangeBuyAndSellRate(Base):
    __tablename__ = "exchange_buy_and_sell_rates"

    __table_args__ = (
        UniqueConstraint(
            "currency_id",
            "effective_date"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    currency_id: Mapped[int] = mapped_column(
        ForeignKey("currencies.id")
    )

    effective_date: Mapped[date] = mapped_column(
        Date,
        index=True
    )

    bid:  Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
    ask:  Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
