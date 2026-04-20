"""News repository - MongoDB access layer for news articles"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from ..core.text_utils import clean_utf8_text


class NewsRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def count(self, query: Dict[str, Any] = None) -> int:
        return await self.db.news.count_documents(query or {})

    async def find_paginated(
        self, query: Dict[str, Any], skip: int, limit: int, sort=None
    ) -> List[Dict]:
        sort = sort or [("published_at", -1)]
        cursor = self.db.news.find(query).sort(sort).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict]:
        return await self.db.news.find_one(query)

    async def distinct(self, field: str) -> List:
        return await self.db.news.distinct(field)

    async def aggregate(self, pipeline: List[Dict]) -> List[Dict]:
        return await self.db.news.aggregate(pipeline).to_list(None)

    async def find_by_ids(self, ids: List[str], limit: int = 10) -> List[Dict]:
        articles = []
        for aid in ids[:limit]:
            doc = await self.db.news.find_one({"id": aid})
            if doc:
                articles.append(doc)
        return articles

    async def latest(self, limit: int = 10) -> List[Dict]:
        cursor = self.db.news.find().sort("published_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def fix_encoding(self) -> Dict[str, int]:
        cursor = self.db.news.find({})
        articles = await cursor.to_list(length=None)
        fixed_count = 0
        for article in articles:
            updates = {}
            if article.get("title"):
                cleaned = clean_utf8_text(article["title"])
                if cleaned != article["title"]:
                    updates["title"] = cleaned
            if article.get("content"):
                cleaned = clean_utf8_text(article["content"])
                if cleaned != article["content"]:
                    updates["content"] = cleaned
            if updates:
                await self.db.news.update_one({"_id": article["_id"]}, {"$set": updates})
                fixed_count += 1
        return {"fixed_count": fixed_count, "total_articles": len(articles)}


class TensionRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def current(self) -> Optional[Dict]:
        return await self.db.tension.find_one({"_id": "current"})


class AISummaryCacheRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get(self, cache_key: str, ttl_minutes: int = 60) -> Optional[Dict]:
        cached = await self.db.ai_summaries.find_one({"_id": cache_key})
        if cached and (datetime.utcnow() - cached.get("generated_at", datetime.min)) < timedelta(minutes=ttl_minutes):
            return cached
        return None

    async def set(self, cache_key: str, payload: Dict):
        await self.db.ai_summaries.update_one(
            {"_id": cache_key}, {"$set": payload}, upsert=True
        )
