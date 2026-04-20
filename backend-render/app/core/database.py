"""MongoDB connection manager"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from .config import MONGO_URL, DB_NAME

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls) -> AsyncIOMotorDatabase:
        """Initialize MongoDB connection"""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(MONGO_URL)
            cls.db = cls.client[DB_NAME]
            logger.info(f"Connected to MongoDB: {DB_NAME}")
        return cls.db

    @classmethod
    async def disconnect(cls):
        """Close MongoDB connection"""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("MongoDB connection closed")

    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance (must be connected first)"""
        if cls.db is None:
            raise RuntimeError("Database not initialized. Call Database.connect() first.")
        return cls.db

    @classmethod
    async def create_indexes(cls):
        """Create MongoDB indexes for performance"""
        db = cls.get_db()
        # News collection indexes
        await db.news.create_index([("published_at", -1)])
        await db.news.create_index([("url_hash", 1)], unique=True)
        await db.news.create_index([("severity", 1)])
        await db.news.create_index([("threat_type", 1)])
        await db.news.create_index([("country", 1)])
        await db.news.create_index([("source", 1)])
        await db.news.create_index([("priority", -1), ("published_at", -1)])
        # V4 indexes
        await db.news.create_index([("attack_type", 1)])
        await db.news.create_index([("sector", 1)])
        await db.news.create_index([("dedup_hash", 1)])
        logger.info("MongoDB indexes ensured")
