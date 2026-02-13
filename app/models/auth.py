from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=120)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, email_value: str) -> str:
        email_value = email_value.strip().lower()
        if not email_value:
            raise ValueError("email cannot be empty")
        return email_value

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, password_value: str) -> str:
        password_value = password_value.strip()
        if not password_value:
            raise ValueError("password cannot be empty")
        return password_value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
