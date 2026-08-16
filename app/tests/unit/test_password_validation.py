import pytest
from pydantic import ValidationError

from dto.user_dto import UserRegisterDTO, validate_password_strength


class TestValidatePasswordStrength:
    @pytest.mark.parametrize(
        "password",
        [
            "StrongPass1!",
            "Abcdefgh1@",
            "aA1!bcdefgh",
            "Password#123",
        ],
    )
    def test_accepts_valid_passwords(self, password):
        assert validate_password_strength(password) == password

    @pytest.mark.parametrize(
        "password",
        [
            "Short1!",
            "alllowercase1!",
            "ALLUPPERCASE1!",
            "NoDigitsHere!",
            "NoSpecialChar1",
            "",
        ],
    )
    def test_rejects_weak_passwords(self, password):
        with pytest.raises(ValueError):
            validate_password_strength(password)


class TestUserRegisterDTO:
    def test_valid_password_passes(self):
        dto = UserRegisterDTO(email="user@example.com", password="StrongPass1!")
        assert dto.email == "user@example.com"

    def test_weak_password_raises(self):
        with pytest.raises(ValidationError):
            UserRegisterDTO(email="user@example.com", password="weak")

    def test_invalid_email_raises(self):
        with pytest.raises(ValidationError):
            UserRegisterDTO(email="not-an-email", password="StrongPass1!")
