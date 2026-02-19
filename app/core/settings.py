from __future__ import annotations

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Environment
    ENV: str = Field(default="dev")
    LOG_LEVEL: str = Field(default="INFO")

    # Database
    DATABASE_URL: str  # required
    DB_SESSION_TIMEOUT_MS: int = Field(default=5000) # 5 second timeout default

    # JWT
    JWT_SECRET: str = Field(default="change-me")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # Web
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    ALLOWED_HOSTS: List[str] = Field(default_factory=lambda: ["localhost", "127.0.0.1"])


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
