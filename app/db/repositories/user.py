from datetime import datetime

from sqlalchemy import select

from db.models.user import User
from db.repositories.base import AsyncRepository
from dto.user_dto import UserCreateDTO, UserDTO


class UserRepository(AsyncRepository[User, UserCreateDTO, UserDTO]):
    model = User
    output_schema = UserDTO

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return await self.session.scalar(stmt)

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        return await self.session.scalar(stmt)

    async def get_all(self) -> list[User]:
        stmt = select(User).order_by(User.created_at.desc())
        result = await self.session.scalars(stmt)
        return list(result.all())

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update(self, user: User) -> User:
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def delete(self, user: User) -> None:
        await self.session.delete(user)

    async def set_reset_token(
        self, user: User, token: str, expires_at: datetime
    ) -> None:
        user.reset_token = token
        user.reset_token_expires_at = expires_at
        await self.session.flush()

    async def clear_reset_token(self, user: User) -> None:
        user.reset_token = None
        user.reset_token_expires_at = None
        await self.session.flush()
