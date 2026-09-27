import pytest
from pydantic import ValidationError

from app.models.auth import LoginRequest, TokenResponse


class TestLoginRequest:
    def test_email_normalized_to_lowercase_and_stripped(self):
        login = LoginRequest(email="  User@Example.com  ", password="password123")
        
        assert login.email == "user@example.com"
    
    def test_password_whitespace_stripped(self):
        login = LoginRequest(email="user@example.com", password="    password123  ")
                
        assert login.password == "password123"

    def test_blank_email_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="   ", password="password123")

    def test_blank_password_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="user@example.com", password="   ")


class TestTokenResponse:
    def test_default_token_type_is_bearer(self):
        response = TokenResponse(access_token="token")
        
        assert response.token_type == "bearer"
