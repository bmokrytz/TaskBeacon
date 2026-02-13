from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health", tags=["health"])
def health_endpoint():
    """
    API service health check.
    - Returns 200 OK if service is running
    """
    logger.info("Sending Health Check")
    return {"status": "ok"}
