from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base
from db.models.user import User


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    default_exchange: Mapped[str | None] = mapped_column(String(20), nullable=True)
    default_currencies: Mapped[list] = mapped_column(
        JSON,
        default=list,
        server_default="[]",
    )

    user: Mapped[User] = relationship()
