"""/api/dashboard endpoints"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Query

from ...core.config import APP_VERSION, APP_NAME, API_VERSION, COUNTRY_NAMES
from ...models.article import NewsArticle
from ...schemas.dashboard import (
    DashboardMetrics,
    DistributionItem,
    DistributionResponse,
    RadarCategory,
    RadarResponse,
    SourceDistributionResponse,
    TimelineEvent,
    TimelineResponse,
    VersionInfo,
)
from ...schemas.news import GroupedNewsResponse
from ...services.sources import RSS_SOURCES
from ..deps import get_news_repository, get_tension_repository

router = APIRouter()


@router.get("/version", response_model=VersionInfo)
async def dashboard_version():
    return VersionInfo(version=APP_VERSION, name=APP_NAME, api_version=API_VERSION)


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    repo = get_news_repository()
    tension = await get_tension_repository().current()
    total_articles = await repo.count()
    critical_vulns = await repo.count({"severity": "critique", "threat_type": "vuln"})
    sources = await repo.distinct("source")
    return DashboardMetrics(
        threat_level=tension.get("level", "Modéré") if tension else "Modéré",
        score=tension.get("score", 30) if tension else 30,
        active_alerts=total_articles,
        critical_vulnerabilities=critical_vulns,
        monitored_sources=len(sources) if sources else len(RSS_SOURCES),
    )


@router.get("/radar", response_model=RadarResponse)
async def get_dashboard_radar():
    repo = get_news_repository()
    mapping = {
        "Phishing": ["phishing"],
        "Ransomware": ["ransomware"],
        "Malware": ["malware"],
        "Vulnérabilités": ["vuln"],
        "Fuite de données": ["data_leak"],
        "DDoS": ["ddos"],
        "Cloud": ["cloud", "aws", "azure"],
        "Identité": ["apt", "identity", "credential"],
    }
    categories = []
    for name, types in mapping.items():
        count = await repo.count({
            "$or": [
                {"threat_type": {"$in": types}},
                {"title": {"$regex": "|".join(types), "$options": "i"}},
            ]
        })
        categories.append(RadarCategory(name=name, value=count))
    return RadarResponse(categories=categories)


@router.get("/news-grouped", response_model=GroupedNewsResponse)
async def get_news_grouped(limit: int = Query(10, ge=1, le=50)):
    """Grouped news with anti-bias (30% max per source) and dedup (75% similarity)."""
    from ...core.config import MAX_SOURCE_PERCENTAGE, TITLE_SIMILARITY_THRESHOLD
    from ...services.dedup import apply_source_bias_limit, deduplicate_articles

    repo = get_news_repository()
    # Fetch 3x limit to leave room for dedup/bias filtering
    buffer = max(limit * 3, 30)
    france_docs = await repo.find_paginated({"country": "FR"}, 0, buffer)
    intl_docs = await repo.find_paginated({"country": {"$ne": "FR"}}, 0, buffer)

    france = [NewsArticle(**d) for d in france_docs]
    intl = [NewsArticle(**d) for d in intl_docs]

    # Chronological tri (most recent first)
    france.sort(key=lambda a: a.published_at, reverse=True)
    intl.sort(key=lambda a: a.published_at, reverse=True)

    # Dedup + anti-bias
    france = deduplicate_articles(france, TITLE_SIMILARITY_THRESHOLD)[:limit]
    intl = apply_source_bias_limit(intl, MAX_SOURCE_PERCENTAGE)
    intl = deduplicate_articles(intl, TITLE_SIMILARITY_THRESHOLD)[:limit]

    france_total = await repo.count({"country": "FR"})
    intl_total = await repo.count({"country": {"$ne": "FR"}})
    return GroupedNewsResponse(
        france=france,
        international=intl,
        france_total=france_total,
        international_total=intl_total,
    )


@router.get("/timeline", response_model=TimelineResponse)
async def get_dashboard_timeline():
    repo = get_news_repository()
    articles = await repo.latest(20)
    severity_map = {"critique": "Critique", "eleve": "Élevé", "moyen": "Moyen", "faible": "Faible"}
    type_map = {"phishing": "Phishing", "ransomware": "Ransomware", "malware": "Malware",
                "vuln": "Vulnérabilité", "data_leak": "Fuite de données", "ddos": "DDoS",
                "apt": "APT", "scam": "Arnaque", "other": "Autre"}
    events = []
    for a in articles:
        tldr = a.get("tldr", [])
        desc = tldr[0] if tldr else a.get("content", "")[:200]
        events.append(TimelineEvent(
            id=a.get("id", str(a.get("_id", ""))),
            title=a.get("title", ""), source=a.get("source", ""),
            severity=severity_map.get(a.get("severity", "moyen"), "Moyen"),
            threat_type=type_map.get(a.get("threat_type", "other"), "Autre"),
            timestamp=a.get("published_at", datetime.utcnow()),
            description=desc, link=a.get("url", ""),
        ))
    return TimelineResponse(events=events)


@router.post("/migrate-countries")
async def force_migrate_countries():
    from ..deps import get_rss_service
    svc = get_rss_service()
    updated = await svc.migrate_country_data()
    return {"message": "Migration complete", "updated": updated}


@router.post("/fix-encoding")
async def fix_encoding():
    result = await get_news_repository().fix_encoding()
    return {"message": "Encoding fix complete", **result}


@router.post("/backfill-attack-type")
async def backfill_attack_type():
    """Backfill attack_type field for legacy articles using their threat_type."""
    from ...core.database import Database
    db = Database.get_db()
    # Set attack_type = threat_type where missing or null
    result = await db.news.update_many(
        {"$or": [{"attack_type": {"$exists": False}}, {"attack_type": None}, {"attack_type": ""}]},
        [{"$set": {"attack_type": "$threat_type"}}],
    )
    return {"message": "Backfill complete", "matched": result.matched_count, "modified": result.modified_count}


@router.get("/summary")
async def get_summary():
    repo = get_news_repository()
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    seven_days_ago = now - timedelta(days=7)
    total_articles = await repo.count()
    critical_count = await repo.count({"severity": "critique"})
    articles_today = await repo.count({"published_at": {"$gte": today_start}})
    articles_7days = await repo.count({"published_at": {"$gte": seven_days_ago}})
    active_sources = len(await repo.distinct("source"))
    sector_result = await repo.aggregate([
        {"$match": {"sector": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$sector", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 1},
    ])
    most_targeted = sector_result[0]["_id"] if sector_result else None
    tension = await get_tension_repository().current()
    return {
        "kpis": {
            "total_articles": total_articles,
            "critical_alerts": critical_count,
            "active_sources": active_sources,
            "most_targeted_sector": most_targeted,
            "articles_today": articles_today,
            "articles_7days": articles_7days,
        },
        "tension_level": tension.get("level", "Modéré") if tension else "Modéré",
        "tension_score": tension.get("score", 0) if tension else 0,
        "last_updated": now,
    }


def _distribution(results, mapper=None) -> DistributionResponse:
    total = sum(r["count"] for r in results)
    data = [
        DistributionItem(
            name=(mapper(r["_id"]) if mapper else (r["_id"] or "other")),
            value=r["count"],
            percentage=round(r["count"] / total * 100, 1) if total > 0 else 0,
        )
        for r in results
    ]
    return DistributionResponse(data=data, total=total)


@router.get("/by-attack-type", response_model=DistributionResponse)
async def by_attack_type():
    res = await get_news_repository().aggregate([
        {"$group": {"_id": "$attack_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])
    return _distribution(res)


@router.get("/by-sector", response_model=DistributionResponse)
async def by_sector():
    res = await get_news_repository().aggregate([
        {"$match": {"sector": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$sector", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])
    return _distribution(res)


@router.get("/by-country", response_model=DistributionResponse)
async def by_country():
    res = await get_news_repository().aggregate([
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])
    return _distribution(res, mapper=lambda c: COUNTRY_NAMES.get(c, c or "Inconnu"))


@router.get("/by-source", response_model=SourceDistributionResponse)
async def by_source():
    res = await get_news_repository().aggregate([
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])
    total = sum(r["count"] for r in res)
    data = [
        DistributionItem(
            name=r["_id"] or "Inconnu", value=r["count"],
            percentage=round(r["count"] / total * 100, 1) if total > 0 else 0,
        )
        for r in res
    ]
    bias = bool(data and data[0].percentage > 30)
    return SourceDistributionResponse(
        data=data, total=total, bias_warning=bias,
        dominant_source=data[0].name if bias else None,
    )


@router.get("/timeline/{period}")
async def timeline_by_period(period: str = "7d"):
    repo = get_news_repository()
    now = datetime.utcnow()
    if period == "24h":
        start = now - timedelta(hours=24)
        fmt = "%Y-%m-%d %H:00"
    elif period == "30d":
        start = now - timedelta(days=30)
        fmt = "%Y-%m-%d"
    else:
        start = now - timedelta(days=7)
        fmt = "%Y-%m-%d"
    results = await repo.aggregate([
        {"$match": {"published_at": {"$gte": start}}},
        {"$group": {
            "_id": {"$dateToString": {"format": fmt, "date": "$published_at"}},
            "count": {"$sum": 1},
            "critical": {"$sum": {"$cond": [{"$eq": ["$severity", "critique"]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$eq": ["$severity", "eleve"]}, 1, 0]}},
            "medium": {"$sum": {"$cond": [{"$eq": ["$severity", "moyen"]}, 1, 0]}},
            "low": {"$sum": {"$cond": [{"$eq": ["$severity", "faible"]}, 1, 0]}},
        }}, {"$sort": {"_id": 1}},
    ])
    total = sum(r["count"] for r in results)
    data = [{"date": r["_id"], "count": r["count"], "critical": r["critical"],
             "high": r["high"], "medium": r["medium"], "low": r["low"]} for r in results]
    return {"period": period, "data": data, "total": total}


@router.get("/top-threats")
async def top_threats(limit: int = Query(3, ge=1, le=10)):
    """Top threats sorted by computed score (severity + recency + source reliability)."""
    from ...core.config import SEVERITY_WEIGHTS, SOURCE_RELIABILITY
    repo = get_news_repository()
    now = datetime.utcnow()
    # Look at the last 7 days
    docs = await repo.find_paginated(
        {"published_at": {"$gte": now - timedelta(days=7)}}, 0, 60,
    )

    def compute_score(a: dict) -> float:
        sev = SEVERITY_WEIGHTS.get(a.get("severity", "moyen"), 2)
        pub = a.get("published_at")
        if isinstance(pub, datetime):
            age_hours = max((now - pub).total_seconds() / 3600.0, 0.5)
        else:
            age_hours = 24.0
        recency = 1.0 / (1 + age_hours / 24.0)  # 1.0 today, ~0.5 after 24h
        reliability = SOURCE_RELIABILITY.get(a.get("source", ""), 0.7)
        priority = a.get("priority", 50) / 100.0
        # Score 0-100
        return round((sev * 20) * (0.5 + 0.5 * recency) * (0.5 + 0.5 * reliability) * (0.7 + 0.3 * priority), 2)

    action_map = {
        "phishing": "Ne cliquez aucun lien — vérifiez l'expéditeur",
        "ransomware": "Vérifiez vos sauvegardes et mettez à jour",
        "malware": "Lancez une analyse antivirus complète",
        "vuln": "Appliquez le correctif dès que disponible",
        "data_leak": "Changez vos mots de passe & vérifiez haveibeenpwned",
        "ddos": "Activez vos protections anti-DDoS",
        "apt": "Alertez votre SOC et vérifiez vos accès",
        "scam": "Ne communiquez aucune donnée personnelle",
    }

    enriched = []
    for a in docs:
        score = compute_score(a)
        attack_type = a.get("attack_type") or a.get("threat_type") or "general"
        actions = a.get("actions") or []
        recommended = actions[0] if actions else action_map.get(attack_type, "Restez vigilant")
        tldr = a.get("tldr")
        if isinstance(tldr, list):
            tldr = " ".join(tldr[:1]) if tldr else ""
        enriched.append({
            "id": a.get("id", str(a.get("_id", ""))),
            "title": a.get("title", ""),
            "attack_type": attack_type,
            "severity": a.get("severity", "moyen"),
            "target": a.get("sector") or a.get("target") or a.get("impact") or "Tous utilisateurs",
            "impact_summary": a.get("impact_summary") or tldr or a.get("impact", ""),
            "recommended_action": recommended,
            "recommended_actions": actions[:3] if actions else [recommended],
            "source": a.get("source", ""),
            "country": a.get("country", "US"),
            "published_at": a.get("published_at"),
            "score": score,
        })

    enriched.sort(key=lambda x: x["score"], reverse=True)
    top = enriched[:limit]
    return {"threats": top, "count": len(top)}
