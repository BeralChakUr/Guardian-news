"""V1 API router aggregation"""
from fastapi import APIRouter

from . import news as news_api
from . import dashboard as dashboard_api
from . import version as version_api
from . import legacy as legacy_api

# Sub-routers
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(news_api.router, tags=["News"])

dashboard_router = APIRouter(prefix="/api/dashboard")
dashboard_router.include_router(dashboard_api.router, tags=["Dashboard"])

version_router = APIRouter()
version_router.include_router(version_api.router, tags=["Version"])

legacy_router = APIRouter(prefix="/api")
legacy_router.include_router(legacy_api.router, tags=["Legacy"])

ALL_ROUTERS = [version_router, v1_router, dashboard_router, legacy_router]
