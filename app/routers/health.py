from fastapi import APIRouter, FastAPI

router = APIRouter()

@router.get("/health")
async def health_endpoint():
    return {"status": "ok"}
