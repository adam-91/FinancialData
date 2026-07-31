from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base
from db.models.stock_exchange_index import StockExchangeIndex


class StockExchangeIndexRate(Base):
    __tablename__ = "stock_exchange_indexe_rates"

    __table_args__ = (UniqueConstraint("index_id", "trading_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    index_id: Mapped[int] = mapped_column(ForeignKey("stock_exchange_indexes.id"))
    trading_date: Mapped[date] = mapped_column(Date, index=True)
    open: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    high: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    low: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    close: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    adj_close: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    volume: Mapped[Decimal] = mapped_column(Numeric(20, 4))

    UniqueConstraint("index_id", "trading_date")

    stock_exchange_indexes: Mapped["StockExchangeIndex"] = relationship() 