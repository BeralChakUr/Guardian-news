"""Legacy /api endpoints (backward compatibility)"""
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Query

from ...schemas.news import AISummaryRequest, AISummaryResponse, NewsResponse
from . import news as news_api

router = APIRouter()


@router.get("/news", response_model=NewsResponse)
async def get_news_legacy(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=50),
    severity: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None, alias="type"),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    return await news_api.get_news(
        page, page_size, severity, threat_type, level, search, country, date_from, date_to
    )


@router.get("/news/tension")
async def get_tension_legacy():
    return await news_api.get_tension()


@router.get("/news/{news_id}")
async def get_news_detail_legacy(news_id: str):
    return await news_api.get_news_detail(news_id)


@router.post("/news/ai-summary", response_model=AISummaryResponse)
async def ai_summary_legacy(request: AISummaryRequest):
    return await news_api.ai_summary(request)


@router.post("/news/refresh")
async def refresh_legacy(background_tasks: BackgroundTasks):
    return await news_api.trigger_refresh(background_tasks)


@router.post("/admin/migrate-countries")
async def migrate_countries_legacy():
    from ..deps import get_rss_service
    svc = get_rss_service()
    updated = await svc.migrate_country_data()
    return {"message": "Migration complete", "updated": updated}
