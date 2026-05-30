from typing import TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base

if TYPE_CHECKING:
    from db.models.exchange_mid_rate import ExchangeMidRate
    from db.models.exchange_buy_and_sell_rate import ExchangeBuyAndSellRate

class Currency(Base):
    __tablename__ = "currencies"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(
        String(3),
        unique=True,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100))
    rates: Mapped[list["ExchangeMidRate", "ExchangeBuyAndSellRate"]] = relationship(
        back_populates="currency",
        cascade="all, delete-orphan"
    )
