from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.api.deps import get_token_payload
from app.core.database import get_session
from app.core.ids import uuid_from_company_id
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.crud.user import create_user, get_user_by_email
from app.models.user import UserRole
from app.schemas.user import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse


router = APIRouter()


@router.post("/auth/register", response_model=TokenResponse)
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    existing = await get_user_by_email(session, req.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = await create_user(
        session,
        email=req.email,
        password=req.password,
        company_name=req.company_name,
        role=req.role,
    )
    await session.commit()

    access = create_access_token(
        user_id=str(user.id),
        company_id=str(user.company_id),
        role=str(user.role.value),
        jti=str(uuid.uuid4()),
    )
    refresh = create_refresh_token(
        user_id=str(user.id),
        company_id=str(user.company_id),
        role=str(user.role.value),
        jti=str(uuid.uuid4()),
    )
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    user = await get_user_by_email(session, req.email)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access = create_access_token(
        user_id=str(user.id),
        company_id=str(user.company_id),
        role=str(user.role.value),
        jti=str(uuid.uuid4()),
    )
    refresh = create_refresh_token(
        user_id=str(user.id),
        company_id=str(user.company_id),
        role=str(user.role.value),
        jti=str(uuid.uuid4()),
    )
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest) -> TokenResponse:
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access = create_access_token(
        user_id=str(payload["sub"]),
        company_id=str(payload.get("company_id", "")),
        role=str(payload.get("role", "")),
        jti=str(uuid.uuid4()),
    )
    refresh = create_refresh_token(
        user_id=str(payload["sub"]),
        company_id=str(payload.get("company_id", "")),
        role=str(payload.get("role", "")),
        jti=str(uuid.uuid4()),
    )
    return TokenResponse(access_token=access, refresh_token=refresh)

