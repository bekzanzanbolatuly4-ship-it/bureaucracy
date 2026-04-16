from __future__ import annotations

import asyncio

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse

from app.api.deps import get_company_id_from_ws_token
from app.api.v1.auth import router as auth_router
from app.api.v1.ai import router as ai_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.kpi import router as kpi_router
from app.core.config import get_settings
from app.core.database import engine

from redis.asyncio import Redis


settings = get_settings()

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(title="Bureaucracy Buster KZ", version="2.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(kpi_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(integrations_router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws/company")
async def ws_company(websocket: WebSocket, company_id: str | None = None) -> None:
    # Clients provide `token` query param. We derive company_id from the token.
    await websocket.accept()
    try:
        company_id = await get_company_id_from_ws_token(websocket)

        # MVP: keep a lightweight keep-alive channel.
        await websocket.send_json({"type": "connected", "company_id": company_id})

        while True:
            # Wait for client pings/messages (or disconnect).
            await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        return


@app.on_event("startup")
async def startup_checks() -> None:
    # Ensure Redis is reachable when running production docker-compose.
    # We don't fail startup if Redis is down to keep local dev friendly.
    try:
        redis = Redis.from_url(settings.redis_url)
        await redis.ping()
    except Exception:
        pass

