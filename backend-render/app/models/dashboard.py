"""Dashboard models."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DashboardMetrics(BaseModel):
    """Main dashboard metrics."""
    threat_level: str = Field(..., description="Current threat level")
    threat_score: int = Field(..., ge=0, le=100, description="Threat score 0-100")
    active_alerts: int = Field(..., ge=0, description="Number of active alerts")
    critical_vulnerabilities: int = Field(..., ge=0, description="Critical vulns count")
    monitored_sources: int = Field(..., ge=0, description="Number of sources")
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RadarDataPoint(BaseModel):
    """Single radar data point."""
    category: str
    value: int = Field(..., ge=0, le=100)


class RadarData(BaseModel):
    """Threat radar data."""
    data: List[RadarDataPoint]
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TimelineEvent(BaseModel):
    """Timeline event."""
    id: str
    title: str
    source: str
    severity: str
    threat_type: str
    timestamp: datetime
    description: Optional[str] = None
    link: Optional[str] = None


class TimelineResponse(BaseModel):
    """Timeline response."""
    events: List[TimelineEvent]
    total: int
