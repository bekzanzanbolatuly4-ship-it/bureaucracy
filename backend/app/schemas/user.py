from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    role: UserRole = UserRole.analyst


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class CurrentUser(BaseModel):
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    role: UserRole
    email: EmailStr
    is_active: bool

