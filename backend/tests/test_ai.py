from __future__ import annotations

from app.ai.gigachat_analyzer import _heuristic_analyze
from app.schemas.ai import AnalyzeRequest, Workflow, WorkflowStep


def test_heuristic_analyze_returns_roi() -> None:
    req = AnalyzeRequest(
        company_id=None,
        workflow=Workflow(
            name="Оборудование закупка",
            steps=[
                WorkflowStep(name="Директор approval", duration_hours=72, approvals=1, cost_kzt_hour=25000),
                WorkflowStep(name="Заявка", duration_hours=2, approvals=1, cost_kzt_hour=5000),
            ],
        ),
        total_monthly_volume=45,
        target_reduction="50%",
    )
    result = _heuristic_analyze(req)
    assert len(result.bottlenecks) >= 1
    assert result.overall_roi.total_monthly_saving_kzt > 0
    assert result.overall_roi.confidence > 0

