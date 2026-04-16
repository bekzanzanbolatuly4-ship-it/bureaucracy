from __future__ import annotations

import datetime as dt
import uuid

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    steps: Mapped[dict] = mapped_column(JSONB, nullable=False)
    avg_duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    bottleneck_score: Mapped[float | None] = mapped_column(Float, nullable=True)


class AILog(Base):
    __tablename__ = "ai_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[dict] = mapped_column(JSONB, nullable=False)
    execution_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=dt.datetime.utcnow)

