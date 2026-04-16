from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    name: str
    duration_hours: float = Field(..., description="Total duration in hours")
    approvals: int = Field(..., description="Number of approvals in this step")
    cost_kzt_hour: float = Field(..., description="Estimated cost per hour")


class Workflow(BaseModel):
    name: str
    steps: list[WorkflowStep]


class AnalyzeRequest(BaseModel):
    company_id: str | None = None
    workflow: Workflow
    total_monthly_volume: int
    target_reduction: str = Field(..., description="e.g. '50%'")


class Bottleneck(BaseModel):
    step_name: str
    current_delay_hours: float
    impact_score: float
    monthly_cost_kzt: int


class Recommendation(BaseModel):
    action: str
    expected_reduction: str
    implementation_days: int
    monthly_saving_kzt: int
    payback_months: float


class OverallROI(BaseModel):
    total_monthly_saving_kzt: int
    annual_roi_percent: float
    confidence: float


class AnalyzeResponse(BaseModel):
    bottlenecks: list[Bottleneck]
    recommendations: list[Recommendation]
    overall_roi: OverallROI

