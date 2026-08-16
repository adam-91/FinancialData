import jwt
import structlog
from fastapi import HTTPException

from core.config import settings
from core.email import send_email
from core.security import (
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)
from db.models.user import User
from db.repositories.user import UserRepository
from dto.user_dto import UserResponseDTO

logger = structlog.get_logger()


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register(self, email: str, password: str) -> UserResponseDTO:
        existing = await self.repo.get_by_email(email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(email=email, hashed_password=hash_password(password))
        user = await self.repo.create(user)
        return UserResponseDTO.model_validate(user)

    async def authenticate(self, email: str, password: str) -> User:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is disabled")
        return user

    async def request_password_reset(self, email: str) -> None:
        user = await self.repo.get_by_email(email)
        if not user:
            return

        token = create_reset_token(user.email)
        link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        body = (
            "We received a request to reset your password.\n\n"
            f"Click the link below to set a new password:\n{link}\n\n"
            "If you did not request this, you can ignore this email."
        )
        await send_email(user.email, "Password reset", body)

    async def reset_password(self, token: str, new_password: str) -> None:
        payload = self._decode_reset_token(token)
        user = await self.repo.get_by_email(payload["sub"])
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        await self.repo.update_password(user, hash_password(new_password))

    async def change_password(
        self,
        user: User,
        old_password: str,
        new_password: str,
    ) -> None:
        if not verify_password(old_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        await self.repo.update_password(user, hash_password(new_password))

    @staticmethod
    def _decode_reset_token(token: str) -> dict:
        try:
            payload = decode_token(token)
        except jwt.exceptions.InvalidTokenError as err:
            raise HTTPException(
                status_code=400, detail="Invalid or expired token"
            ) from err

        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
        return payload
