import time
import uuid
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get existing request id or create a new one
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

        # Store it so handlers/other middleware can access it
        request.state.request_id = request_id

        start = time.perf_counter()  # Log request handling time

        try:
            response: Response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000.0
            logger.exception(
                "%s %s -> 500 (%.2fms) request_id=%s",
                request.method,
                request.url.path,
                duration_ms,
                request_id,
            )
            raise

        duration_ms = (time.perf_counter() - start) * 1000.0
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "%s %s -> %s (%.2fms) request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )

        return response