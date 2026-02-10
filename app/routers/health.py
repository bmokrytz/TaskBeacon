from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["health"])
def health_endpoint():
    """
    API service health check.
    - Returns 200 OK if service is running
    """
    return {"status": "ok"}
