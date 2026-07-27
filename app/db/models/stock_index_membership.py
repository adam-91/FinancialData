from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db.models.stock_company import StockCompany
    from db.models.stock_exchange_index import StockExchangeIndex


class StockIndexMembership(Base):
    __tablename__ = "stock_indexe_memberships"

    index_id: Mapped[int] = mapped_column(
        ForeignKey("stock_exchange_indexes.id"),
        primary_key=True, 
        index=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("stock_companies.id"), 
        primary_key=True,
          index=True)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        index=True)
    left_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        index=True, 
        nullable=True)
    active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        index=True)
    
    stock_index: Mapped["StockExchangeIndex"] = relationship()
    stock_company: Mapped["StockCompany"] = relationship(
        back_populates="stock_index_memberships"
    ) 