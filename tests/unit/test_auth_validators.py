import pytest
from pydantic import ValidationError

from app.models.auth import LoginRequest


class TestLoginRequest:
    def test_email_normalized_to_lowercase_and_stripped(self):
        login = LoginRequest(email="  User@Example.com  ", password="password123")
        assert login.email == "user@example.com"

    def test_blank_email_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="   ", password="password123")

    def test_blank_password_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="user@example.com", password="   ")
