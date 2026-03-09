"""Routes package."""
from .news import router as news_router
from .dashboard import router as dashboard_router
from .ai import router as ai_router

__all__ = [
    "news_router",
    "dashboard_router",
    "ai_router",
]
