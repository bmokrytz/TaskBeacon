from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_endpoint():
    return {"status": "ok"}
