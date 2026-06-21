from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base
from db.models.stock_exchange import StockExchange


class StockCompany(Base):
    __tablename__ = "stock_companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    symbol: Mapped[str] = mapped_column(String(), unique=True, index=True)
    yahoo_symbol: Mapped[str] = mapped_column(String(), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    exchange_id: Mapped[str] = mapped_column(ForeignKey("stock_exchanges.id"))
    active: Mapped[bool] = mapped_column(Boolean)

    stock_exchange: Mapped["StockExchange"] = relationship() 