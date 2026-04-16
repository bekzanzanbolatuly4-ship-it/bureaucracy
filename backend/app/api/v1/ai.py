from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_token_payload
from app.ai.gigachat_analyzer import analyze_workflow_with_log
from app.core.database import get_session
from app.core.ids import uuid_from_company_id
from app.schemas.ai import AnalyzeRequest, AnalyzeResponse


router = APIRouter()


@router.post("/ai/analyze", response_model=AnalyzeResponse)
async def analyze(
    req: AnalyzeRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> AnalyzeResponse:
    token_company_id: str | None = None
    try:
        payload = await get_token_payload(request)
        token_company_id = payload.get("company_id")
    except HTTPException:
        token_company_id = None

    resolved_company_id = req.company_id or token_company_id
    if not resolved_company_id:
        # MVP demo fallback to let the endpoint be called without auth.
        resolved_company_id = "demo-company"

    if req.company_id and token_company_id and req.company_id.strip().lower() != token_company_id.strip().lower():
        raise HTTPException(status_code=403, detail="company_id mismatch")

    # Ensure DB receives a UUID
    _ = uuid_from_company_id(resolved_company_id)
    return await analyze_workflow_with_log(db_session=session, req=req, company_id=resolved_company_id)

