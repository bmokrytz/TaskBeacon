from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, enable_csp: bool = False):
        super().__init__(app)
        self.enable_csp = enable_csp

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        if self.enable_csp:
            # Basic CSP. Tighten later when serving a frontend.
            response.headers["Content-Security-Policy"] = "default-src 'self'"

        return response