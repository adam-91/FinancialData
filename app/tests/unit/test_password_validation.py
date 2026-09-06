import pytest

from core.security import PasswordValidationError, validate_password_strength


def test_accepts_password_with_letters_and_digits():
    validate_password_strength("Password123")


def test_rejects_short_password():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("Pass1")


def test_rejects_password_without_digit():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("PasswordOnly")


def test_rejects_password_without_letter():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("1234567890")


def test_rejects_empty_password():
    with pytest.raises(PasswordValidationError):
        validate_password_strength("")
