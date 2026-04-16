from __future__ import annotations

import datetime as dt
import uuid
from typing import Literal

from pydantic import BaseModel, Field


class KPIImportItem(BaseModel):
    metric_name: str
    value: float = Field(..., description="Actual KPI value")
    target: float = Field(..., description="Target KPI value")
    period_date: dt.date


class KPIImportRequest(BaseModel):
    company_id: uuid.UUID
    items: list[KPIImportItem]


class KPISummaryItem(BaseModel):
    metric_name: str
    value: float
    target: float
    period_date: dt.date


class KPISummaryResponse(BaseModel):
    company_id: uuid.UUID
    items: list[KPISummaryItem]


class MonthlyROIResponse(BaseModel):
    monthly_saving_kzt: int
    payback_months: float
    confidence: float


class ExportFormat(str):
    pass

