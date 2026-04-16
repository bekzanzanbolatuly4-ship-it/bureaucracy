from __future__ import annotations

import asyncio
from celery import Celery

from app.ai.gigachat_analyzer import analyze_workflow_with_log
from app.core.config import get_settings
from app.core.database import get_session
from app.schemas.ai import AnalyzeRequest


settings = get_settings()

celery_app = Celery(
    "bureaucracy-buster-kz",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)


@celery_app.task(name="ai.analyze_workflow")
def analyze_workflow_task(payload: dict) -> dict:
    """
    Celery entrypoint (sync) that runs the async analyzer with a fresh DB session.
    MVP: heuristics; production can swap to real GigaChat calls.
    """

    async def _run() -> dict:
        req = AnalyzeRequest(**payload["req"])
        company_id = str(payload["company_id"])
        async with get_session() as session:  # type: ignore[misc]
            result = await analyze_workflow_with_log(db_session=session, req=req, company_id=company_id)
            return result.model_dump()

    return asyncio.run(_run())

