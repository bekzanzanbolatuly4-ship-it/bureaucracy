from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.kpi import create_company_if_missing  # re-export helper
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.models.user import UserRole


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    res = await session.execute(select(User).where(User.email == email))
    return res.scalar_one_or_none()


async def create_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    company_name: str,
    role: UserRole,
) -> User:
    # MVP: create company if missing (by name).
    company = await create_company_if_missing(session, company_name=company_name)
    user = User(
        email=email,
        company_id=company.id,
        role=role,
        password_hash=hash_password(password),
        is_active=True,
    )
    session.add(user)
    await session.flush()
    return user

