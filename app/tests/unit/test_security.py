import jwt
import pytest

from core.security import (
    create_access_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        hashed = hash_password("StrongPass1!")
        assert hashed != "StrongPass1!"
        assert verify_password("StrongPass1!", hashed)

    def test_verify_wrong_password(self):
        hashed = hash_password("StrongPass1!")
        assert not verify_password("WrongPass1!", hashed)

    def test_verify_invalid_hash(self):
        assert not verify_password("StrongPass1!", "not-a-valid-hash")


class TestJwt:
    def test_access_token_roundtrip(self):
        token = create_access_token("user@example.com", "user")
        payload = decode_token(token)
        assert payload["sub"] == "user@example.com"
        assert payload["role"] == "user"
        assert payload["type"] == "access"

    def test_reset_token_type(self):
        token = create_reset_token("user@example.com")
        payload = decode_token(token)
        assert payload["type"] == "reset"

    def test_invalid_token_raises(self):
        with pytest.raises(jwt.exceptions.InvalidTokenError):
            decode_token("invalid-token")
