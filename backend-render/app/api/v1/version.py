"""Version endpoint"""
from fastapi import APIRouter

from ...core.config import APP_VERSION, APP_NAME, API_VERSION
from ...schemas.dashboard import VersionInfo

router = APIRouter()


@router.get("/api/version", response_model=VersionInfo)
async def get_app_version():
    """Get application version info (V4.0)"""
    return VersionInfo(version=APP_VERSION, name=APP_NAME, api_version=API_VERSION)
