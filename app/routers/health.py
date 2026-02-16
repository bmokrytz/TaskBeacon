from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
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

@router.get("/db-ping")
def db_ping(db: Session = Depends(get_db)):
    """
    Database service health check.
    - Returns 200 OK if service is running
    """
    db.execute(text("SELECT 1"))
    return {"status": "ok"}