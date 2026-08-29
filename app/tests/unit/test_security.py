import pytest
from fastapi import HTTPException

from core.security import (
    PasswordValidationError,
    create_access_token,
    create_reset_token,
    decode_token,
    hash_password,
    validate_password_strength,
    verify_password,
)


def test_hash_and_verify_password():
    hashed = hash_password("Secret123")
    assert hashed != "Secret123"
    assert verify_password("Secret123", hashed)
    assert not verify_password("WrongPass1", hashed)


def test_verify_password_returns_false_for_invalid_hash():
    assert not verify_password("Secret123", "not-a-valid-bcrypt-hash")


def test_validate_password_strength_accepts_valid():
    validate_password_strength("Secret123")


def test_validate_password_strength_too_short():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("Abc1")


def test_validate_password_strength_missing_digit():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("SecretPassword")


def test_validate_password_strength_missing_letter():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("12345678")


def test_access_token_roundtrip():
    token = create_access_token("admin@example.com")
    payload = decode_token(token, "access")
    assert payload["sub"] == "admin@example.com"


def test_reset_token_has_wrong_type_when_decoded_as_access():
    token = create_reset_token("admin@example.com")
    with pytest.raises(HTTPException):
        decode_token(token, "access")
