from fastapi import FastAPI, Request, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
import logging

logger = logging.getLogger(__name__)

class InvalidCredentialsError(Exception):
    """
    Raised when user authentication fails due to invalid credentials.
    """
    pass

class EmailAlreadyInUseError(Exception):
    """
    Raised when attempting to register a user with an email that is already in use.
    """
    pass


def _payload(error: str, message: str, details=None, request_id: str | None = None) -> dict:
    """
    Build the standard JSON error response body used by all exception handlers.
    
    Args:
        error (str): a machine-readable error code string (e.g. "not_found", "validation_error", etc.).
        message (str): a human-readable error message.
        details (any, optional): Optional extra context, such as validation errors or retry info.
            Left out of the payload when None.
        request_id (str, optional): Optional ID for tracing the request. Left out of the payload
            when not provided.

    Returns:
        A dict with the error context.
        Keys for error and message are always present.
        Keys for details and request_id are only present when provided.
    """
    
    data = {"error": error, "message": message}
    if details is not None:
        data["details"] = details
    if request_id:
        data["request_id"] = request_id
    return data


def _http_error_code_from_status(status_code: int) -> str:
    """
    A simple mapping of HTTP status codes to the machine-readable error code strings.
    
    Args:
        status_code (int): The HTTP status code.
        
    Returns:
        A machine-readable error code string.
    """
    
    mapping = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        409: "conflict",
        422: "validation_error",
        500: "internal_error",
    }
    return mapping.get(status_code, "http_error")


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers custom exception handlers to the FastAPI app.
    """
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """
        Exception handler for HTTP exceptions.
        """
        
        error_code = _http_error_code_from_status(exc.status_code)
        return JSONResponse(
            status_code=exc.status_code,
            content=_payload(error_code, str(exc.detail)),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """
        Exception handler for request validation exceptions.
        """
        return JSONResponse(
            status_code=422,
            content=_payload(
                "validation_error",
                "Request validation failed",
                details=jsonable_encoder(exc.errors()),
            ),
        )
        
    @app.exception_handler(RateLimitExceeded)
    def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        """
        Exception handler for rate limit exceptions.
        """
        # slowAPI middleware requires sync exception handler
        request_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            status_code=429,
            content=_payload(
                "rate_limited",
                "Too many requests",
                details={"retry_after": getattr(exc, "retry_after", None)},
                request_id=request_id,
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """
        Exception handler for unhandled exceptions.
        """
        # Log full details internally, return generic to client by http
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content=_payload("internal_error", "Internal server error"),
        )