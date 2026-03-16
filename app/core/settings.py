from __future__ import annotations

from typing import List, Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
import os


class Settings(BaseSettings):

    # Dynamically decide whether to load .env
    model_config = SettingsConfigDict(
        env_file=".env" if os.getenv("ENV", "DEV") == "DEV" else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Environment
    ENV: Literal["DEV", "PROD"] = "DEV"
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # Database
    DATABASE_URL: str
    DB_SESSION_TIMEOUT_MS: int = Field(default=5000)
    DB_CONNECT_TIMEOUT_S: int = 2
    DB_POOL_TIMEOUT_S: int = 2

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # Web
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    ALLOWED_HOSTS: str = Field(default="localhost,127.0.0.1")

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_DEFAULT: str = Field(default="120/minute")
    RATE_LIMIT_AUTH_LOGIN: str = Field(default="10/minute")
    RATE_LIMIT_AUTH_REGISTER: str = Field(default="5/minute")
    RATE_LIMIT_AUTH_ME: str = Field(default="60/minute")

    def get_log_level(self) -> int:
        return getattr(logging, self.LOG_LEVEL.upper(), logging.INFO)
    
    def allowed_hosts_list(self) -> list[str]:
        return [h.strip() for h in self.ALLOWED_HOSTS.split(",") if h.strip()]


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
