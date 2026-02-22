import logging
from fastapi import FastAPI

from app.core.settings import get_settings
from app.routers.health import router as health_endpoint_router
from app.routers.tasks import router as tasks_endpoint_router
from app.routers.auth import router as auth_endpoint_router


tags_metadata = [
    {"name": "health", "description": "Service health checks."},
    {"name": "auth", "description": "Registration, login, and authentication helpers."},
    {"name": "tasks", "description": "Task CRUD operations (requires authentication)."},
]


def create_app() -> FastAPI:
    """
    Creates the TaskBeacon FastAPI app.
    - load settings
    - configure logging
    - create app
    - attach routers
    """
    settings = get_settings()

    # Configure logging
    logging.basicConfig(
        level=settings.get_log_level(),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Hide docs in production env mode
    docs_url = "/docs" if settings.ENV == "DEV" else None
    redoc_url = "/redoc" if settings.ENV == "DEV" else None
    openapi_url = "/openapi.json" if settings.ENV == "DEV" else None

    app = FastAPI(
        title="TaskBeacon",
        version="0.1.0",
        openapi_tags=tags_metadata,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    
    # Request logging 
    from app.middleware.request_logging import RequestLoggingMiddleware
    app.add_middleware(RequestLoggingMiddleware)
    
    # Security headers middleware
    from app.middleware.security_headers import SecurityHeadersMiddleware
    app.add_middleware(
        SecurityHeadersMiddleware, 
        enable_csp=(settings.ENV == "prod"),
    )
    
    # CORS middleware
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=False,    # JWT in Authorization header -> cookies not needed
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # TrustedHost middleware
    from starlette.middleware.trustedhost import TrustedHostMiddleware
    if settings.ENV == "PROD":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS,
        )
    
    # Error handling
    from app.core.errors import register_exception_handlers
    register_exception_handlers(app)

    # Routers
    app.include_router(health_endpoint_router)
    app.include_router(tasks_endpoint_router)
    app.include_router(auth_endpoint_router)

    logging.getLogger(__name__).info("TaskBeacon app created ENV=%s", settings.ENV)
    return app


app = create_app()
