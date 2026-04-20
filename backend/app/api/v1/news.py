"""/api/v1/news endpoints"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from ...core.config import MAX_SOURCE_PERCENTAGE, TITLE_SIMILARITY_THRESHOLD
from ...core.database import Database
from ...models.article import NewsArticle
from ...schemas.news import (
    AISummaryItem,
    AISummaryRequest,
    AISummaryResponse,
    NewsResponse,
    TensionResponse,
)
from ...services.ai_service import generate_ai_summary
from ...services.dedup import apply_source_bias_limit, deduplicate_articles
from ..deps import get_news_repository, get_rss_service, get_tension_repository, get_ai_cache_repository

router = APIRouter()


@router.get("/news", response_model=NewsResponse)
async def get_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=50),
    severity: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None, alias="type"),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None, description="FR, US, ..."),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
):
    """Paginated news with filters, anti-bias and deduplication."""
    repo = get_news_repository()
    filter_query = {}
    if severity:
        filter_query["severity"] = severity
    if threat_type:
        filter_query["threat_type"] = threat_type
    if level:
        filter_query["level"] = level
    if country:
        filter_query["country"] = country.upper()
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
        ]
    if date_from or date_to:
        date_filter = {}
        if date_from:
            try:
                date_filter["$gte"] = datetime.strptime(date_from, "%Y-%m-%d")
            except ValueError:
                pass
        if date_to:
            try:
                date_filter["$lt"] = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            except ValueError:
                pass
        if date_filter:
            filter_query["published_at"] = date_filter

    total = await repo.count(filter_query)
    skip = (page - 1) * page_size
    docs = await repo.find_paginated(filter_query, skip, page_size)
    items = [NewsArticle(**d) for d in docs]

    severity_order = {"critique": 0, "eleve": 1, "moyen": 2, "faible": 3}
    items.sort(key=lambda x: (x.published_at.date(), severity_order.get(x.severity, 4)))
    items.sort(key=lambda x: x.published_at, reverse=True)

    items = apply_source_bias_limit(items, MAX_SOURCE_PERCENTAGE)
    items = deduplicate_articles(items, TITLE_SIMILARITY_THRESHOLD)

    return NewsResponse(
        items=items, total=total, page=page, page_size=page_size,
        has_more=(skip + len(items)) < total,
    )


@router.get("/news/tension", response_model=TensionResponse)
async def get_tension():
    tension = await get_tension_repository().current()
    if not tension:
        return TensionResponse(
            level="Modéré", score=30, reason="Calcul en cours...",
            critical_count=0, high_count=0,
            recent_threats=[], updated_at=datetime.utcnow(),
        )
    return TensionResponse(
        level=tension["level"], score=tension["score"], reason=tension["reason"],
        critical_count=tension["critical_count"], high_count=tension["high_count"],
        medium_count=tension.get("medium_count", 0),
        low_count=tension.get("low_count", 0),
        total_7days=tension.get("total_7days", 0),
        recent_threats=tension["recent_threats"], updated_at=tension["updated_at"],
    )


@router.get("/news/{news_id}")
async def get_news_detail(news_id: str):
    article = await get_news_repository().find_one({"id": news_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return NewsArticle(**article)


@router.post("/news/refresh")
async def trigger_refresh(background_tasks: BackgroundTasks):
    rss = get_rss_service()
    background_tasks.add_task(rss.run_ingestion)
    return {"message": "Refresh started", "status": "processing"}


@router.post("/news/ai-summary", response_model=AISummaryResponse)
async def ai_summary(request: AISummaryRequest):
    repo = get_news_repository()
    cache = get_ai_cache_repository()
    if request.article_ids:
        articles = await repo.find_by_ids(request.article_ids, request.limit)
    else:
        articles = await repo.latest(request.limit)
    if not articles:
        raise HTTPException(status_code=404, detail="No articles found")

    import hashlib as _hl
    cache_key = f"ai_summary_{request.mode.value}_{_hl.md5(str([a['id'] for a in articles]).encode()).hexdigest()}"
    cached = await cache.get(cache_key)
    if cached:
        return AISummaryResponse(
            mode=request.mode.value,
            generated_at=cached["generated_at"],
            items=[AISummaryItem(**i) for i in cached["items"]],
            global_summary=cached["global_summary"],
        )

    ai_result = await generate_ai_summary(articles, request.mode.value)
    items = []
    for idx, article in enumerate(articles):
        ai_item = ai_result.get("items", [{}])[idx] if idx < len(ai_result.get("items", [])) else {}
        tldr = article.get("tldr", "Aucun résumé")
        if isinstance(tldr, list):
            tldr = " ".join(tldr) if tldr else "Aucun résumé"
        summary_text = ai_item.get("summary") or tldr
        if isinstance(summary_text, list):
            summary_text = " ".join(summary_text) if summary_text else tldr
        items.append(AISummaryItem(
            article_id=article["id"],
            title_fr=ai_item.get("title_fr", article["title"]),
            summary=summary_text,
            threat_type=ai_item.get("threat_type", article.get("threat_type", "autre")),
            severity=ai_item.get("severity", article.get("severity", "moyenne")),
            source=article["source"], link=article["url"],
            key_info=ai_item.get("key_info"), action=ai_item.get("action"),
        ))
    response = AISummaryResponse(
        mode=request.mode.value,
        generated_at=datetime.utcnow(),
        items=items,
        global_summary=ai_result.get("global_summary", "Analyse en cours..."),
    )
    await cache.set(cache_key, {
        "generated_at": response.generated_at,
        "items": [i.dict() for i in items],
        "global_summary": response.global_summary,
    })
    return response
