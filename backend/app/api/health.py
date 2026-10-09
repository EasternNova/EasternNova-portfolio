from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment
    }