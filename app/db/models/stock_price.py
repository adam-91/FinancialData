from datetime import date
from decimal import Decimal
from sqlalchemy import Date, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base


class Stock(Base):
    __tablename__ = "stock"

    __table_args__ = (
        UniqueConstraint(
            "stock_id",
            "trading_date"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    stock_id: Mapped[int] = mapped_column(
        ForeignKey("stock.id")
    )
    trading_date: Mapped[date] = mapped_column(
        Date,
        index=True
    )
    open: Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
    high: Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
    low: Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
    close: Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
    adj_close: Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )
    volume: Mapped[Decimal] = mapped_column(
        Numeric(10, 4)
    )

    UniqueConstraint(
        "stock_id",
        "trading_date"
    )
