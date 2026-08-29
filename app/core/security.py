from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from db.database import get_session
from db.models.user import User
from db.repositories.user import UserRepository

JWT_SUBJECT_CLAIM = "sub"
JWT_TOKEN_TYPE_CLAIM = "type"
JWT_EXPIRES_CLAIM = "exp"

ACCESS_TOKEN_TYPE = "access"
RESET_TOKEN_TYPE = "reset"

BCRYPT_MAX_PASSWORD_BYTES = 72


class PasswordValidationError(ValueError):
    pass


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:BCRYPT_MAX_PASSWORD_BYTES]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode("utf-8")[:BCRYPT_MAX_PASSWORD_BYTES]
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except ValueError:
        return False


def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise PasswordValidationError("Password must be at least 8 characters long")

    if not any(char.isalpha() for char in password):
        raise PasswordValidationError("Password must contain at least one letter")

    if not any(char.isdigit() for char in password):
        raise PasswordValidationError("Password must contain at least one digit")


def _create_token(subject: str, token_type: str, expires_minutes: int) -> str:
    now = datetime.now(UTC)
    payload = {
        JWT_SUBJECT_CLAIM: subject,
        JWT_TOKEN_TYPE_CLAIM: token_type,
        "iat": now,
        JWT_EXPIRES_CLAIM: now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(
        payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def create_access_token(subject: str) -> str:
    return _create_token(
        subject, ACCESS_TOKEN_TYPE, settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )


def create_reset_token(subject: str) -> str:
    return _create_token(subject, RESET_TOKEN_TYPE, settings.RESET_TOKEN_EXPIRE_MINUTES)


def decode_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.PyJWTError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from err

    if payload.get(JWT_TOKEN_TYPE_CLAIM) != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    return payload


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_session),
) -> User:
    token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_token(token, ACCESS_TOKEN_TYPE)
    subject = payload.get(JWT_SUBJECT_CLAIM)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    repo = UserRepository(db)
    user = await repo.get_by_email(subject)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return user
