from __future__ import annotations

import datetime as dt
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def _utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def create_access_token(
    *,
    user_id: str,
    company_id: str,
    role: str,
    jti: str,
) -> str:
    now = _utcnow()
    exp = now + dt.timedelta(minutes=settings.access_token_exp_minutes)
    payload: dict[str, Any] = {
        "sub": user_id,
        "company_id": company_id,
        "role": role,
        "type": "access",
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(
    *,
    user_id: str,
    company_id: str,
    role: str,
    jti: str,
) -> str:
    now = _utcnow()
    exp = now + dt.timedelta(days=settings.refresh_token_exp_days)
    payload: dict[str, Any] = {
        "sub": user_id,
        "company_id": company_id,
        "role": role,
        "type": "refresh",
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as e:
        raise ValueError("Invalid token") from e


def token_type(payload: dict[str, Any]) -> str:
    return str(payload.get("type", ""))

