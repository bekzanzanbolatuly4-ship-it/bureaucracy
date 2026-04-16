from __future__ import annotations

import os
from typing import Any

from pydantic import BaseModel, Field


class Settings(BaseModel):
    env: str = Field(default_factory=lambda: os.getenv("ENV", "development"))

    # Postgres / Redis
    database_url: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://postgres:postgres@postgres:5432/bb_kz",
        )
    )
    redis_url: str = Field(
        default_factory=lambda: os.getenv("REDIS_URL", "redis://redis:6379/0")
    )

    # Auth
    jwt_secret: str = Field(
        default_factory=lambda: os.getenv("JWT_SECRET", "dev_only_change_me")
    )
    jwt_algorithm: str = Field(default_factory=lambda: os.getenv("JWT_ALG", "HS256"))
    access_token_exp_minutes: int = Field(
        default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXP_MIN", "15"))
    )
    refresh_token_exp_days: int = Field(
        default_factory=lambda: int(os.getenv("REFRESH_TOKEN_EXP_DAYS", "7"))
    )

    # GigaChat (AI Law 2026 logging requires full prompt/response storage)
    gigachat_client_id: str | None = Field(
        default_factory=lambda: os.getenv("GIGACHAT_CLIENT_ID") or None
    )
    gigachat_client_secret: str | None = Field(
        default_factory=lambda: os.getenv("GIGACHAT_CLIENT_SECRET") or None
    )

    # Celery
    celery_broker_url: str = Field(
        default_factory=lambda: os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    )
    celery_result_backend: str = Field(
        default_factory=lambda: os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
    )

    cors_origins: str | None = Field(default_factory=lambda: os.getenv("CORS_ORIGINS"))

    @property
    def cors_allow_list(self) -> list[str]:
        if not self.cors_origins:
            return ["*"]
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

