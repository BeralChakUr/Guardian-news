"""API schemas (request/response DTOs)"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from ..models.article import NewsArticle
from ..models.enums import SummaryMode


# News schemas
class NewsResponse(BaseModel):
    items: List[NewsArticle]
    total: int
    page: int
    page_size: int
    has_more: bool


class TensionResponse(BaseModel):
    level: str
    score: int
    reason: str
    critical_count: int
    high_count: int
    medium_count: int = 0
    low_count: int = 0
    total_7days: int = 0
    recent_threats: List[str]
    updated_at: datetime


# AI Summary schemas
class AISummaryRequest(BaseModel):
    mode: SummaryMode = SummaryMode.SIMPLE
    article_ids: Optional[List[str]] = None
    limit: int = 5


class AISummaryItem(BaseModel):
    article_id: str
    title_fr: str
    summary: str
    threat_type: str
    severity: str
    source: str
    link: str
    key_info: Optional[str] = None
    action: Optional[str] = None


class AISummaryResponse(BaseModel):
    mode: str
    generated_at: datetime
    items: List[AISummaryItem]
    global_summary: str


# Grouped news
class GroupedNewsResponse(BaseModel):
    france: List[NewsArticle]
    international: List[NewsArticle]
    france_total: int
    international_total: int
