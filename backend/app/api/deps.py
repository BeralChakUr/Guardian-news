"""Dependency provider for services & repositories"""
from typing import Optional

from ..core.database import Database
from ..repositories.news_repository import (
    AISummaryCacheRepository,
    NewsRepository,
    TensionRepository,
)
from ..services.rss_service import RSSFetcherService

# Singletons (initialized at app startup)
_rss_service: Optional[RSSFetcherService] = None


def get_news_repository() -> NewsRepository:
    return NewsRepository(Database.get_db())


def get_tension_repository() -> TensionRepository:
    return TensionRepository(Database.get_db())


def get_ai_cache_repository() -> AISummaryCacheRepository:
    return AISummaryCacheRepository(Database.get_db())


def get_rss_service() -> RSSFetcherService:
    global _rss_service
    if _rss_service is None:
        _rss_service = RSSFetcherService(Database.get_db())
    return _rss_service


def reset_rss_service():
    global _rss_service
    _rss_service = None
