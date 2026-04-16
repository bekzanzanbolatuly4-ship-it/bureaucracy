from __future__ import annotations

import datetime as dt
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_token_payload
from app.core.database import get_session
from app.core.ids import uuid_from_company_id
from app.crud.kpi import create_company_if_missing, get_kpi_summary, upsert_kpis
from app.schemas.kpi import KPIImportItem


router = APIRouter()


class ImportTask(BaseModel):
    name: str = Field(..., description="Workflow step / metric name")
    duration_hours: float


class KPIImportWebhookRequest(BaseModel):
    company_id: str
    tasks: list[ImportTask]


@router.post("/kpi/import")
async def import_kpi(
    req: KPIImportWebhookRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> dict[str, bool]:
    token_company_id: str | None = None
    try:
        payload = await get_token_payload(request)
        token_company_id = payload.get("company_id")
    except HTTPException:
        token_company_id = None

    if token_company_id and req.company_id.strip().lower() != str(token_company_id).strip().lower():
        raise HTTPException(status_code=403, detail="company_id mismatch")

    company_uuid = uuid_from_company_id(req.company_id)
    await create_company_if_missing(session, company_name=req.company_id)
    items: list[KPIImportItem] = []
    today = dt.date.today()
    for t in req.tasks:
        items.append(
            KPIImportItem(metric_name=t.name, value=float(t.duration_hours), target=0.0, period_date=today)
        )
    await upsert_kpis(session, company_id=company_uuid, items=items)
    await session.commit()
    return {"ok": True}


@router.get("/kpi/summary")
async def kpi_summary(
    request: Request,
    session: AsyncSession = Depends(get_session),
    company_id: str | None = Query(default=None),
) -> dict:
    token_company_id: str | None = None
    try:
        payload = await get_token_payload(request)
        token_company_id = payload.get("company_id")
    except HTTPException:
        token_company_id = None

    resolved_company_id = company_id or token_company_id
    if not resolved_company_id:
        raise HTTPException(status_code=400, detail="company_id is required")
    company_uuid = uuid_from_company_id(resolved_company_id)

    kpis = await get_kpi_summary(session, company_id=company_uuid)
    items = [
        {
            "metric_name": k.metric_name,
            "value": float(k.value),
            "target": float(k.target),
            "period_date": k.period_date.isoformat(),
        }
        for k in kpis
    ]
    return {"company_id": str(resolved_company_id), "items": items}

