import pytest
from pydantic import ValidationError

from app.models.user import UserCreate


class TestUserCreate:
    def test_email_normalized_to_lowercase_and_stripped(self):
        user = UserCreate(email="  User@Example.com  ", password="password123")
        assert user.email == "user@example.com"

    def test_blank_email_rejected(self):
        with pytest.raises(ValidationError):
            UserCreate(email="   ", password="password123")

    def test_blank_password_rejected(self):
        with pytest.raises(ValidationError):
            UserCreate(email="user@example.com", password="        ")

    def test_password_below_min_length_rejected(self):
        with pytest.raises(ValidationError):
            UserCreate(email="user@example.com", password="short")
