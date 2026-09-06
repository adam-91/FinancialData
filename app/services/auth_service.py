import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status

from core.config import settings
from core.email import send_email
from core.security import (
    PasswordValidationError,
    create_access_token,
    create_reset_token,
    decode_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from db.models.user import User
from db.repositories.user import UserRepository
from dto.user_dto import UserUpdateDTO


def _validate_password(password: str) -> None:
    try:
        validate_password_strength(password)
    except PasswordValidationError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        ) from err


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def login(self, email: str, password: str) -> tuple[User, str]:
        user = await self.user_repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        token = create_access_token(user.email)
        return user, token

    async def change_password(
        self, user: User, current_password: str, new_password: str
    ) -> None:
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        self._set_password(user, new_password)
        await self.user_repo.save()

    async def reset_password(self, token: str, new_password: str) -> None:
        payload = decode_token(token, "reset")
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token",
            )

        user = await self.user_repo.get_by_email(email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token",
            )

        if (
            not user.reset_token
            or user.reset_token_expires_at is None
            or user.reset_token_expires_at < datetime.now(UTC)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired",
            )

        if user.reset_token != _hash_token(token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token",
            )

        self._set_password(user, new_password)
        await self.user_repo.clear_reset_token(user)
        await self.user_repo.save()

    def _set_password(self, user: User, new_password: str) -> None:
        _validate_password(new_password)
        user.hashed_password = hash_password(new_password)
        user.must_change_password = False
        user.reset_token = None
        user.reset_token_expires_at = None

    async def request_password_reset(self, email: str) -> str:
        user = await self.user_repo.get_by_email(email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        token = create_reset_token(user.email)
        expires_at = datetime.now(UTC) + timedelta(
            minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
        )
        await self.user_repo.set_reset_token(user, _hash_token(token), expires_at)
        await self.user_repo.save()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        await send_email(
            user.email,
            "Password reset",
            f"Use the following link to reset your password: {reset_url}",
        )

        return reset_url

    async def create_user(self, email: str, password: str) -> User:
        existing = await self.user_repo.get_by_email(email)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        _validate_password(password)

        user = User(
            email=email,
            hashed_password=hash_password(password),
            must_change_password=True,
            is_active=True,
        )
        user = await self.user_repo.create(user)
        await self.user_repo.save()
        return user

    async def update_user(
        self, user: User, data: UserUpdateDTO
    ) -> User:
        if data.email is not None and data.email != user.email:
            existing = await self.user_repo.get_by_email(data.email)
            if existing is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User with this email already exists",
                )
            user.email = data.email

        if data.is_active is not None:
            user.is_active = data.is_active

        if data.password is not None:
            _validate_password(data.password)
            user.hashed_password = hash_password(data.password)
            user.must_change_password = True

        user = await self.user_repo.update(user)
        await self.user_repo.save()
        return user

    async def list_users(self) -> list[User]:
        return await self.user_repo.get_all()

    async def delete_user(self, user: User, current_user: User) -> None:
        if user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account",
            )
        await self.user_repo.delete(user)
        await self.user_repo.save()


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
