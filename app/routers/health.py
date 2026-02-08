from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["health"])
def health_endpoint():
    return {"status": "ok"}
