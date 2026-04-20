"""Dashboard API schemas"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    threat_level: str
    score: int
    active_alerts: int
    critical_vulnerabilities: int
    monitored_sources: int


class RadarCategory(BaseModel):
    name: str
    value: int


class RadarResponse(BaseModel):
    categories: List[RadarCategory]


class TimelineEvent(BaseModel):
    id: str
    title: str
    source: str
    severity: str
    threat_type: str
    timestamp: datetime
    description: str
    link: str


class TimelineResponse(BaseModel):
    events: List[TimelineEvent]


class DistributionItem(BaseModel):
    name: str
    value: int
    percentage: float


class DistributionResponse(BaseModel):
    data: List[DistributionItem]
    total: int


class SourceDistributionResponse(BaseModel):
    data: List[DistributionItem]
    total: int
    bias_warning: bool = False
    dominant_source: Optional[str] = None


class VersionInfo(BaseModel):
    version: str
    name: str
    api_version: str
