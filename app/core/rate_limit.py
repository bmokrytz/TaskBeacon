from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.core.settings import get_settings

settings = get_settings()

def rate_limit_key_func(request: Request) -> str:
    """
    Key strategy:
    - If authenticated user is available on request.state, limit per-user
    - Otherwise limit per-IP
    """
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    return f"ip:{get_remote_address(request)}"


limiter = Limiter(
    key_func=rate_limit_key_func,
    default_limits=[settings.RATE_LIMIT_DEFAULT] if settings.RATE_LIMIT_ENABLED else [],
    headers_enabled=True,
)