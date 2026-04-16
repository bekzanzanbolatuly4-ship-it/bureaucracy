from __future__ import annotations

from typing import Any, Callable

from fastapi import Depends, HTTPException, WebSocket
from jose import JWTError

from app.core.security import decode_token


def _extract_bearer_token(headers: Any) -> str | None:
    auth = headers.get("authorization") if hasattr(headers, "get") else None
    if not auth:
        return None
    if not auth.lower().startswith("bearer "):
        return None
    return auth.split(" ", 1)[1].strip()


async def get_company_id_from_ws_token(websocket: WebSocket) -> str:
    token = websocket.query_params.get("token")
    if not token:
        # Close with policy violation-ish code.
        await websocket.close(code=4401)
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = decode_token(token)
    except Exception:
        await websocket.close(code=4403)
        raise HTTPException(status_code=401, detail="Invalid token")

    company_id = payload.get("company_id")
    if not company_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return str(company_id)


async def get_token_payload(websocket_or_request: Any) -> dict[str, Any]:
    # Support both WebSocket and Request by expecting `.headers` and `.query_params` where needed.
    token = None
    if hasattr(websocket_or_request, "headers"):
        token = _extract_bearer_token(websocket_or_request.headers)
    if not token and hasattr(websocket_or_request, "query_params"):
        token = websocket_or_request.query_params.get("token")

    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        return decode_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e


def require_roles(*roles: str) -> Callable[[dict[str, Any]], bool]:
    def _checker(payload: dict[str, Any]) -> bool:
        role = str(payload.get("role", ""))
        return role in set(roles)

    return _checker

