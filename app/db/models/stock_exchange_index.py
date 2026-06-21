from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base
from db.models.stock_exchange import StockExchange


class StockExchangeIndex(Base):
    __tablename__ = "stock_exchange_indexes"

    id: Mapped[int] = mapped_column(primary_key=True)
    stock_exchange_id: Mapped[int] = mapped_column(ForeignKey("stock_exchanges.id"))
    symbol: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean)

    stock_exchange: Mapped["StockExchange"] = relationship() 
