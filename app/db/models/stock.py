from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class Stock(Base):
    __tablename__ = "stock"

    id: Mapped[int] = mapped_column(primary_key=True)
    symbol: Mapped[str] = mapped_column(String(), unique=True, index=True)
    yahoo_symbol: Mapped[str] = mapped_column(String(), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    exchange: Mapped[str] = mapped_column(String(50))
    active: Mapped[bool] = mapped_column(Boolean)
