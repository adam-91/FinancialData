from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def _encode(payload: dict) -> str:
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_access_token(subject: str, role: str) -> str:
    now = datetime.now(UTC)
    return _encode(
        {
            "sub": subject,
            "role": role,
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        }
    )


def create_reset_token(subject: str) -> str:
    now = datetime.now(UTC)
    return _encode(
        {
            "sub": subject,
            "type": "reset",
            "iat": now,
            "exp": now + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        }
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
