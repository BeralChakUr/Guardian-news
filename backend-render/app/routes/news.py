"""News API routes."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from ..database import get_news_collection
from ..models import NewsArticle, NewsListResponse

router = APIRouter(prefix="/api/news", tags=["News"])


@router.get("", response_model=NewsListResponse)
async def get_news(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    source: Optional[str] = Query(None, description="Filter by source"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    threat_type: Optional[str] = Query(None, alias="type", description="Filter by threat type"),
    search: Optional[str] = Query(None, description="Search in title and summary"),
):
    """Get paginated list of news articles."""
    news_col = get_news_collection()
    
    # Build filter
    query = {}
    if source:
        query["source"] = {"$regex": source, "$options": "i"}
    if severity:
        query["severity"] = severity
    if threat_type:
        query["threat_type"] = threat_type
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"raw_summary": {"$regex": search, "$options": "i"}},
            {"ai_summary": {"$regex": search, "$options": "i"}},
        ]
    
    # Get total count
    total = await news_col.count_documents(query)
    
    # Pagination
    skip = (page - 1) * limit
    
    # Fetch articles
    cursor = news_col.find(query).sort("published_at", -1).skip(skip).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    # Convert to response models
    items = []
    for doc in articles:
        doc["id"] = doc.pop("_id", doc.get("id", str(doc.get("_id", ""))))
        if isinstance(doc["id"], object) and hasattr(doc["id"], "__str__"):
            doc["id"] = str(doc["id"])
        items.append(NewsArticle(**doc))
    
    return NewsListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        has_more=(skip + len(items)) < total
    )


@router.get("/{article_id}")
async def get_news_by_id(article_id: str):
    """Get a single news article by ID."""
    news_col = get_news_collection()
    
    # Try to find by id field
    article = await news_col.find_one({"id": article_id})
    
    if not article:
        # Try by _id
        article = await news_col.find_one({"_id": article_id})
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article["id"] = article.pop("_id", article.get("id", ""))
    if isinstance(article["id"], object):
        article["id"] = str(article["id"])
    
    return NewsArticle(**article)
