from fastapi import FastAPI
from app.routers.health import router as health_endpoint_router
from app.routers.tasks import router as tasks_endpoint_router

app = FastAPI(title="TaskBeacon", version="0.1.0")

app.include_router(health_endpoint_router)
app.include_router(tasks_endpoint_router)
