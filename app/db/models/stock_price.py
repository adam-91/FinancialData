from datetime import date
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base
from db.models.stock_company import StockCompany


class StockPrice(Base):
    __tablename__ = "stock_prices"

    __table_args__ = (UniqueConstraint("company_id", "trading_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("stock_companies.id"))
    trading_date: Mapped[date] = mapped_column(DateTime(timezone=True), index=True)
    open: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    high: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    low: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    close: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    adj_close: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    volume: Mapped[Decimal] = mapped_column(Numeric(20, 4))

    UniqueConstraint("company_id", "trading_date", name="uq_stock_price_date")

    stock_company: Mapped["StockCompany"] = relationship() 