"""Dashboard API routes."""
from fastapi import APIRouter
from datetime import datetime
from ..database import get_news_collection, get_metrics_collection
from ..models import DashboardMetrics, RadarData, RadarDataPoint, TimelineEvent, TimelineResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """Get main dashboard metrics."""
    metrics_col = get_metrics_collection()
    news_col = get_news_collection()
    
    # Try to get stored metrics
    stored = await metrics_col.find_one({"_id": "current"})
    
    if stored:
        return DashboardMetrics(
            threat_level=stored.get("threat_level", "Moderate"),
            threat_score=stored.get("threat_score", 50),
            active_alerts=stored.get("active_alerts", 0),
            critical_vulnerabilities=stored.get("critical_vulnerabilities", 0),
            monitored_sources=stored.get("monitored_sources", 10),
            updated_at=stored.get("updated_at", datetime.utcnow())
        )
    
    # Calculate from news data
    total_news = await news_col.count_documents({})
    critical_count = await news_col.count_documents({"severity": "critical"})
    high_count = await news_col.count_documents({"severity": "high"})
    
    # Calculate threat score
    score = min(100, critical_count * 25 + high_count * 10)
    
    if score >= 70:
        level = "Critical"
    elif score >= 40:
        level = "High"
    elif score >= 20:
        level = "Moderate"
    else:
        level = "Low"
    
    return DashboardMetrics(
        threat_level=level,
        threat_score=score,
        active_alerts=total_news,
        critical_vulnerabilities=critical_count,
        monitored_sources=10,
        updated_at=datetime.utcnow()
    )


@router.get("/radar", response_model=RadarData)
async def get_threat_radar():
    """Get threat radar data."""
    metrics_col = get_metrics_collection()
    news_col = get_news_collection()
    
    # Try to get stored radar data
    stored = await metrics_col.find_one({"_id": "radar"})
    
    if stored and "data" in stored:
        return RadarData(
            data=[RadarDataPoint(**d) for d in stored["data"]],
            updated_at=stored.get("updated_at", datetime.utcnow())
        )
    
    # Calculate from news data
    threat_counts = {}
    categories = [
        ("Phishing", "phishing"),
        ("Ransomware", "ransomware"),
        ("Malware", "malware"),
        ("Vulnérabilités", "vulnerability"),
        ("Fuite données", "data_breach"),
        ("DDoS", "ddos"),
        ("Cloud", "cloud"),
        ("Identité", "identity"),
    ]
    
    for label, threat_type in categories:
        count = await news_col.count_documents({"threat_type": threat_type})
        # Normalize to 0-100 scale (assuming max 10 articles per category)
        threat_counts[label] = min(100, count * 10) if count > 0 else 20
    
    radar_data = [
        RadarDataPoint(category=label, value=threat_counts.get(label, 20))
        for label, _ in categories
    ]
    
    return RadarData(data=radar_data, updated_at=datetime.utcnow())


@router.get("/timeline", response_model=TimelineResponse)
async def get_threat_timeline():
    """Get chronological threat timeline."""
    news_col = get_news_collection()
    
    # Get recent news sorted by date
    cursor = news_col.find().sort("published_at", -1).limit(20)
    articles = await cursor.to_list(length=20)
    
    events = []
    for doc in articles:
        article_id = doc.get("id", str(doc.get("_id", "")))
        events.append(TimelineEvent(
            id=str(article_id),
            title=doc.get("title", "Unknown"),
            source=doc.get("source", "Unknown"),
            severity=doc.get("severity", "medium"),
            threat_type=doc.get("threat_type", "other"),
            timestamp=doc.get("published_at", datetime.utcnow()),
            description=doc.get("ai_summary") or doc.get("raw_summary"),
            link=doc.get("link")
        ))
    
    return TimelineResponse(events=events, total=len(events))
