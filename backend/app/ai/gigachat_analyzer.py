from __future__ import annotations

import json
import re
import time
from typing import Any

from app.core.config import get_settings
from app.core.ids import uuid_from_company_id
from app.crud.kpi import create_company_if_missing
from app.models.workflow import AILog
from app.schemas.ai import AnalyzeRequest, AnalyzeResponse


settings = get_settings()

ANALYSIS_SYSTEM_PROMPT = """
Ты ведущий эксперт по оптимизации бизнес-процессов в Казахстане.

ТВОЯ ЗАДАЧА:
1) Анализировать workflow из 1C/Bitrix24 данных
2) Находить bottlenecks (удержки >24ч или >3 approvals)
3) Предлагать оптимизации с ROI расчетом

OUTPUT JSON ONLY (строго).
"""


def _parse_reduction(target_reduction: str) -> float:
    # Accept "50%" => 0.5
    m = re.search(r"(\d+(?:\.\d+)?)\s*%?", target_reduction)
    if not m:
        return 0.5
    v = float(m.group(1))
    if v > 1:
        return v / 100.0
    return v


def _heuristic_analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    reduction = _parse_reduction(req.target_reduction)
    bottlenecks = []
    for step in req.workflow.steps:
        is_bottleneck = step.duration_hours >= 24 or step.approvals > 3
        if not is_bottleneck:
            continue
        # delay approximates current delay as full duration weighted by approvals
        current_delay_hours = float(step.duration_hours)
        # monthly_cost = hours * cost/hour * approvals * monthly volume
        monthly_cost_kzt = int(current_delay_hours * step.cost_kzt_hour * max(1, step.approvals) * req.total_monthly_volume)
        impact = min(0.99, 0.3 + (current_delay_hours / 120.0) + (step.approvals / 10.0))
        bottlenecks.append(
            {
                "step_name": step.name,
                "current_delay_hours": current_delay_hours,
                "impact_score": round(float(impact), 2),
                "monthly_cost_kzt": monthly_cost_kzt,
            }
        )

    if not bottlenecks and req.workflow.steps:
        # Fallback: pick the longest step
        top = max(req.workflow.steps, key=lambda s: s.duration_hours)
        monthly_cost_kzt = int(top.duration_hours * top.cost_kzt_hour * max(1, top.approvals) * req.total_monthly_volume)
        bottlenecks = [
            {
                "step_name": top.name,
                "current_delay_hours": float(top.duration_hours),
                "impact_score": 0.6,
                "monthly_cost_kzt": monthly_cost_kzt,
            }
        ]

    total_monthly_cost = sum(b["monthly_cost_kzt"] for b in bottlenecks)
    total_monthly_saving = int(total_monthly_cost * reduction)
    payback_months = round(1.0 / max(0.05, reduction) / 10.0, 1)  # MVP-friendly heuristic
    confidence = 0.72

    recommendations = []
    for b in sorted(bottlenecks, key=lambda x: x["monthly_cost_kzt"], reverse=True)[:3]:
        recommendations.append(
            {
                "action": "parallel_processing + автоаппрув <24ч",
                "expected_reduction": f"{int(round(reduction * 100))}%",
                "implementation_days": 5,
                "monthly_saving_kzt": int(b["monthly_cost_kzt"] * reduction),
                "payback_months": payback_months,
            }
        )

    overall_roi = {
        "total_monthly_saving_kzt": total_monthly_saving,
        "annual_roi_percent": round((total_monthly_saving * 12) / max(1, total_monthly_cost) * 100.0, 2),
        "confidence": confidence,
    }
    return AnalyzeResponse(
        bottlenecks=bottlenecks,
        recommendations=recommendations,
        overall_roi=overall_roi,
    )


def analyze_workflow(req: AnalyzeRequest) -> dict[str, Any]:
    """
    Returns the JSON object matching `AnalyzeResponse` (but as a dict for easier logging).
    """
    start = time.time()

    # MVP heuristic always works; optional GigaChat call later.
    resp = _heuristic_analyze(req)

    _ = time.time() - start
    return resp.model_dump()


async def analyze_workflow_with_log(
    *,
    db_session: Any,
    req: AnalyzeRequest,
    company_id: str,
) -> AnalyzeResponse:
    start = time.time()
    result = analyze_workflow(req)
    execution_ms = int((time.time() - start) * 1000)

    # AI Law 2026 compliance: store prompt + response.
    prompt = {
        "system": ANALYSIS_SYSTEM_PROMPT,
        "input": req.model_dump(),
    }

    # Ensure FK target exists so ai_logs insert won't fail.
    await create_company_if_missing(db_session, company_name=company_id)

    log = AILog(
        company_id=uuid_from_company_id(company_id),
        prompt=json.dumps(prompt, ensure_ascii=False),
        response=result,
        execution_ms=execution_ms,
        model_version="mvp_heuristic",
    )
    db_session.add(log)
    await db_session.commit()
    return AnalyzeResponse(**result)

