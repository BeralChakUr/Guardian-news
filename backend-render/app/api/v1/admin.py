"""/api/v1/admin — administrative maintenance endpoints."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query

from ...core.database import Database
from ..deps import get_news_repository, get_rss_service

router = APIRouter()


def _is_legacy_article(doc: dict) -> bool:
    """Heuristics to detect legacy/corrupted articles."""
    if doc.get("score") in (None, 0):
        return True
    if doc.get("dedup_hash") in (None, ""):
        return True
    # Check impossible dates (published_at > fetched_at + 30 days)
    pub = doc.get("published_at")
    fetched = doc.get("fetched_at")
    if isinstance(pub, datetime) and isinstance(fetched, datetime):
        if (pub - fetched).days > 30:
            return True
    # Check corrupted encoding (stripped French accents in French sources)
    french_sources = {"CERT-FR", "ANSSI", "Cybermalveillance.gouv", "Sekoia",
                      "Global Security Mag", "Le Monde Informatique"}
    if doc.get("source") in french_sources:
        title = (doc.get("title") or "")
        content = (doc.get("content") or "")[:400]
        combined = title + " " + content
        if len(combined) > 60:
            if not any(c in "éèêëàâäùûüîïôöç" for c in combined.lower()):
                return True
            if "\ufffd" in combined or "ï¿" in combined:
                return True
    return False


@router.get("/health")
async def admin_health():
    """Quick admin health check."""
    db = Database.get_db()
    total = await db.news.count_documents({})
    # Sample of suspicious articles
    cursor = db.news.find({}, {"title": 1, "score": 1, "dedup_hash": 1,
                                "published_at": 1, "fetched_at": 1, "source": 1, "content": 1})
    legacy = 0
    null_score = 0
    null_hash = 0
    bad_dates = 0
    async for doc in cursor:
        if doc.get("score") in (None, 0):
            null_score += 1
        if doc.get("dedup_hash") in (None, ""):
            null_hash += 1
        pub = doc.get("published_at")
        fetched = doc.get("fetched_at")
        if isinstance(pub, datetime) and isinstance(fetched, datetime):
            if (pub - fetched).days > 30:
                bad_dates += 1
        if _is_legacy_article(doc):
            legacy += 1
    return {
        "total_articles": total,
        "legacy_or_corrupted": legacy,
        "null_score": null_score,
        "null_dedup_hash": null_hash,
        "bad_dates": bad_dates,
        "collection": "news",
        "database": Database.get_db().name,
    }


@router.post("/reset-news-and-reingest")
async def reset_news_and_reingest(dry_run: bool = Query(False)):
    """**DESTRUCTIVE** — Delete ALL news articles, then re-ingest from RSS feeds.

    - `dry_run=true` : only return what would happen, without touching data.
    """
    db = Database.get_db()
    collection_name = "news"
    total_before = await db.news.count_documents({})

    if dry_run:
        return {
            "mode": "dry_run",
            "collection": collection_name,
            "database": db.name,
            "would_delete": total_before,
            "would_reingest": True,
            "message": f"Would delete {total_before} articles and re-run RSS ingestion",
        }

    # 1. Delete ALL articles in the news collection
    delete_result = await db.news.delete_many({})
    deleted = delete_result.deleted_count

    # 2. Also clear tension cache + AI summary cache (they reference article IDs)
    await db.tension.delete_many({})
    await db.ai_summaries.delete_many({})

    # 3. Trigger fresh RSS ingestion
    rss = get_rss_service()
    saved = await rss.run_ingestion()

    # 4. Sanity check on a sample of fresh articles
    sample = await db.news.find({}, {"score": 1, "dedup_hash": 1,
                                      "impact_summary": 1, "target": 1,
                                      "published_at": 1, "fetched_at": 1,
                                      "title": 1}).limit(5).to_list(5)

    sample_info = [
        {
            "title": (s.get("title") or "")[:60],
            "has_score": s.get("score") is not None,
            "has_dedup_hash": bool(s.get("dedup_hash")),
            "has_impact_summary": bool(s.get("impact_summary")),
            "has_target": bool(s.get("target")),
            "published_at": s.get("published_at").isoformat() if isinstance(s.get("published_at"), datetime) else None,
            "fetched_at": s.get("fetched_at").isoformat() if isinstance(s.get("fetched_at"), datetime) else None,
        }
        for s in sample
    ]

    new_total = await db.news.count_documents({})
    return {
        "mode": "executed",
        "collection": collection_name,
        "database": db.name,
        "deleted": deleted,
        "total_before": total_before,
        "reingested": saved,
        "total_after": new_total,
        "sample_quality_check": sample_info,
    }


@router.post("/reset-corrupted-only")
async def reset_corrupted_only(dry_run: bool = Query(False)):
    """Softer variant: only remove articles detected as legacy/corrupted."""
    db = Database.get_db()
    cursor = db.news.find({})
    to_delete = []
    async for doc in cursor:
        if _is_legacy_article(doc):
            to_delete.append(doc["_id"])

    if dry_run:
        return {
            "mode": "dry_run",
            "would_delete": len(to_delete),
            "message": f"Would delete {len(to_delete)} legacy articles and re-ingest",
        }

    deleted = 0
    if to_delete:
        res = await db.news.delete_many({"_id": {"$in": to_delete}})
        deleted = res.deleted_count

    rss = get_rss_service()
    saved = await rss.run_ingestion()
    return {
        "mode": "executed",
        "deleted": deleted,
        "reingested": saved,
        "total_after": await db.news.count_documents({}),
    }
