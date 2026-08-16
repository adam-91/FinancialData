from sqlalchemy import select

from db.models.user import User
from db.repositories.base import AsyncRepository
from dto.user_dto import UserRegisterDTO, UserResponseDTO


class UserRepository(AsyncRepository[User, UserRegisterDTO, UserResponseDTO]):
    model = User
    output_schema = UserResponseDTO

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return await self.session.scalar(stmt)

    async def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def save(self, user: User) -> User:
        await self.session.commit()
        await self.session.refresh(user)
        return user
