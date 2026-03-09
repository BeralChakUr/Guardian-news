"""News article models."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ThreatType(str, Enum):
    PHISHING = "phishing"
    RANSOMWARE = "ransomware"
    MALWARE = "malware"
    VULNERABILITY = "vulnerability"
    DATA_BREACH = "data_breach"
    DDOS = "ddos"
    APT = "apt"
    SCAM = "scam"
    OTHER = "other"


class NewsArticle(BaseModel):
    """News article model."""
    id: str = Field(..., description="Unique article ID")
    title: str = Field(..., description="Article title")
    source: str = Field(..., description="Source name")
    link: str = Field(..., description="Original article URL")
    published_at: datetime = Field(..., description="Publication date")
    raw_summary: Optional[str] = Field(None, description="Original summary")
    ai_summary: Optional[str] = Field(None, description="AI-generated summary")
    threat_type: Optional[str] = Field(None, description="Type of threat")
    severity: Optional[str] = Field(None, description="Severity level")
    mitre_tactic: Optional[str] = Field(None, description="MITRE ATT&CK tactic")
    owasp_category: Optional[str] = Field(None, description="OWASP category")
    tags: List[str] = Field(default_factory=list, description="Article tags")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "article-001",
                "title": "Critical Vulnerability in Apache Log4j",
                "source": "CERT-FR",
                "link": "https://example.com/article",
                "published_at": "2024-01-15T10:30:00Z",
                "severity": "critical",
                "threat_type": "vulnerability"
            }
        }


class NewsListResponse(BaseModel):
    """Response for news list endpoint."""
    items: List[NewsArticle]
    total: int
    page: int
    limit: int
    has_more: bool


class NewsFilters(BaseModel):
    """Query filters for news."""
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
    source: Optional[str] = None
    severity: Optional[str] = None
    threat_type: Optional[str] = None
    search: Optional[str] = None
