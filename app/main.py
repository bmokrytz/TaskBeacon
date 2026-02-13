from fastapi import FastAPI
from app.routers.health import router as health_endpoint_router
from app.routers.tasks import router as tasks_endpoint_router
from app.routers.auth import router as auth_endpoint_router
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

tags_metadata = [
    {"name": "health", "description": "Service health checks."},
    {"name": "auth", "description": "Registration, login, and authentication helpers."},
    {"name": "tasks", "description": "Task CRUD operations (requires authentication)."},
]

app = FastAPI(title="TaskBeacon", version="0.1.0", openapi_tags=tags_metadata)

app.include_router(health_endpoint_router)
app.include_router(tasks_endpoint_router)
app.include_router(auth_endpoint_router)


