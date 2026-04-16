from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.ids import uuid_from_company_id


router = APIRouter()


class IntegrationTask1C(BaseModel):
    id: str | None = None
    start: datetime | None = None
    end: datetime | None = None
    status: str | None = None
    approver: str | None = None
    dept: str | None = None
    value_kzt: int | None = None


class IntegrationWebhook1C(BaseModel):
    company_id: str
    tasks: list[IntegrationTask1C]


@router.post("/integrations/1c/webhook")
async def webhook_1c(payload: IntegrationWebhook1C) -> dict[str, Any]:
    # MVP stub: accept and validate shape, reserve for historical sync.
    _ = uuid_from_company_id(payload.company_id)
    return {"ok": True, "received_tasks": len(payload.tasks)}


class IntegrationWebhookBitrix(BaseModel):
    company_id: str
    data: dict[str, Any] = Field(default_factory=dict)


@router.post("/integrations/bitrix/webhook")
async def webhook_bitrix(payload: IntegrationWebhookBitrix) -> dict[str, Any]:
    _ = uuid_from_company_id(payload.company_id)
    return {"ok": True}

