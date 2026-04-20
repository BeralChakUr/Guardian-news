"""Article domain models (Pydantic)"""
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from .enums import Severity, ThreatType, ThreatLevel, Audience


class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    source: str
    source_score: int = 7
    url: str
    published_at: datetime
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    severity: Severity = Severity.MOYEN
    threat_type: ThreatType = ThreatType.OTHER
    level: ThreatLevel = ThreatLevel.INTERMEDIAIRE
    audience: Audience = Audience.TOUS
    tldr: List[str] = []
    impact: str = ""
    actions: List[str] = []
    content: str = ""
    url_hash: str = ""
    country: str = "US"
    language: str = "en"
    priority: int = 50
    # V4 optional fields
    attack_type: Optional[str] = None
    sector: Optional[str] = None
    score: Optional[float] = None
    dedup_hash: Optional[str] = None
    impact_summary: Optional[str] = None
    target: Optional[str] = None
