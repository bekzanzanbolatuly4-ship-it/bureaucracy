from __future__ import annotations

import datetime as dt
import enum
import uuid

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    company_admin = "company_admin"
    executive = "executive"
    analyst = "analyst"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    company_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="userrole"), nullable=False, default=UserRole.analyst)

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.utcnow)

    # Relationship is optional for now (migration can add FK constraints later).
    company = relationship("Company", primaryjoin="User.company_id==Company.id", viewonly=True)

