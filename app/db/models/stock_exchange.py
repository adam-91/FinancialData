from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class StockExchange(Base):
    __tablename__ = "stock_exchanges"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    symbol: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    country: Mapped[str] = mapped_column(String(100), index=True)
    ticker: Mapped[str] = mapped_column(String(4), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean)
