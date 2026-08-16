import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

PASSWORD_MIN_LENGTH = 10

_PASSWORD_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("at least 10 characters", re.compile(r".{10,}")),
    ("a lowercase letter", re.compile(r"[a-z]")),
    ("an uppercase letter", re.compile(r"[A-Z]")),
    ("a digit", re.compile(r"\d")),
    ("a special character", re.compile(r"[^A-Za-z0-9]")),
]


def validate_password_strength(value: str) -> str:
    failures = [
        requirement
        for requirement, pattern in _PASSWORD_RULES
        if not pattern.search(value)
    ]

    if failures:
        raise ValueError("Password must contain " + ", ".join(failures) + ".")

    return value


class UserRegisterDTO(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_is_strong(cls, value: str) -> str:
        return validate_password_strength(value)


class UserLoginDTO(BaseModel):
    email: EmailStr
    password: str


class ResetRequestDTO(BaseModel):
    email: EmailStr


class ResetConfirmDTO(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_is_strong(cls, value: str) -> str:
        return validate_password_strength(value)


class ChangePasswordDTO(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_is_strong(cls, value: str) -> str:
        return validate_password_strength(value)


class UserResponseDTO(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
