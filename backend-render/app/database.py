"""MongoDB database connection and helpers."""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import get_settings

logger = logging.getLogger(__name__)

# Global database client
_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_db() -> None:
    """Connect to MongoDB."""
    global _client, _db
    settings = get_settings()
    
    if not settings.MONGO_URL:
        logger.error("MONGO_URL not configured")
        raise ValueError("MONGO_URL environment variable is required")
    
    try:
        _client = AsyncIOMotorClient(
            settings.MONGO_URL,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000,
        )
        _db = _client[settings.DB_NAME]
        
        # Test connection
        await _client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {settings.DB_NAME}")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def disconnect_db() -> None:
    """Disconnect from MongoDB."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("Disconnected from MongoDB")


def get_db() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db


# Collection helpers
def get_news_collection():
    """Get news_articles collection."""
    return get_db().news_articles


def get_metrics_collection():
    """Get dashboard_metrics collection."""
    return get_db().dashboard_metrics


def get_timeline_collection():
    """Get threat_timeline collection."""
    return get_db().threat_timeline


def get_ai_summaries_collection():
    """Get ai_summaries collection (cache)."""
    return get_db().ai_summaries
