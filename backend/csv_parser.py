from __future__ import annotations

import csv
import io
from typing import Any


def _get(d: dict[str, Any], *keys: str) -> Any:
    for k in keys:
        if k in d and d[k] != "":
            return d[k]
    return None


def parse_steps_from_csv_bytes(raw: bytes) -> list[dict[str, Any]]:
    """
    CSV parser for MVP.
    Expected headers (any subset allowed):
    - step OR name
    - duration_hours
    - approvals
    - cost_kzt_hour OR cost_per_hour_kzt
    """
    text = raw.decode("utf-8", errors="replace")
    f = io.StringIO(text)
    sample = text[:1024]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=[",", ";", "\t"])
    except Exception:
        dialect = csv.excel

    reader = csv.DictReader(f, dialect=dialect)
    steps: list[dict[str, Any]] = []

    for row in reader:
        if not row:
            continue
        step_name = _get(row, "step", "name", "task", "workflow_step")
        if not step_name:
            continue

        duration_hours = _get(row, "duration_hours", "duration", "hours")
        approvals = _get(row, "approvals", "approval_count")
        cost_kzt_hour = _get(row, "cost_kzt_hour", "cost_per_hour_kzt", "cost_kzt", "cost")

        # Keep values as numbers where possible, but analysis.py is resilient.
        steps.append(
            {
                "step": str(step_name),
                "duration_hours": duration_hours,
                "approvals": approvals if approvals is not None else 1,
                "cost_kzt_hour": cost_kzt_hour if cost_kzt_hour is not None else 0,
            }
        )

    return steps

