from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyze import analyze_workflow
from csv_parser import parse_steps_from_csv_bytes


def _get_cors_origins() -> list[str]:
    origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [x.strip() for x in origins.split(",") if x.strip()]


app = FastAPI(title="Bureaucracy Buster (MVP self-healing)", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins() or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze_endpoint(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        return analyze_workflow(payload)
    except Exception:
        # Self-healing rule: never crash; always return strict contract.
        return analyze_workflow({})


@app.post("/api/csv/upload")
async def upload_csv(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    try:
        raw = await file.read()
        steps = parse_steps_from_csv_bytes(raw)
        return analyze_workflow({"steps": steps})
    except Exception:
        return analyze_workflow({})

