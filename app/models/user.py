from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

class UserPublic(BaseModel):
    id: UUID
    email: str = Field(..., min_length=1, max_length=120)
    created_at: datetime
    
    @field_validator("email")
    @classmethod
    def email_not_blank(cls, email_value: str) -> str:
        email_value = email_value.strip().lower()
        if not email_value:
            raise ValueError("email cannot be empty")
        return email_value

class UserCreate(BaseModel):
    email: str = Field(..., min_length=1, max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
    
    @field_validator("email")
    @classmethod
    def email_not_blank(cls, email_value: str) -> str:
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

class User(BaseModel):
    id: UUID
    email: str = Field(..., min_length=1, max_length=120)
    password_hash: str = Field(..., max_length=255)
    created_at: datetime

    @field_validator("email")
    @classmethod
    def email_not_blank(cls, email_value: str) -> str:
        email_value = email_value.strip().lower()
        if not email_value:
            raise ValueError("email cannot be empty")
        return email_value
