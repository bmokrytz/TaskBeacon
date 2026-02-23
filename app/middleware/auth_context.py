from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.auth.jwt import get_token_subject

class AuthContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.user_id = None

        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.removeprefix("Bearer ").strip()
            try:
                request.state.user_id = get_token_subject(token)
            except Exception:
                pass # Token is invalid so will rate limit based on IP instead

        return await call_next(request)