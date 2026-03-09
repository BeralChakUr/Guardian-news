"""AI service models."""
from typing import Optional
from pydantic import BaseModel, Field


class AISummarizeRequest(BaseModel):
    """Request for AI summarization."""
    text: str = Field(..., min_length=10, description="Text to summarize")
    title: Optional[str] = Field(None, description="Article title for context")
    source: Optional[str] = Field(None, description="Source name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "A critical vulnerability has been discovered in...",
                "title": "Critical CVE-2024-XXXX",
                "source": "CISA"
            }
        }


class AISummarizeResponse(BaseModel):
    """Response from AI summarization."""
    ai_summary: str = Field(..., description="Generated summary")
    threat_type: str = Field(..., description="Identified threat type")
    severity: str = Field(..., description="Assessed severity")
    mitre_tactic: Optional[str] = Field(None, description="MITRE ATT&CK tactic")
    owasp_category: Optional[str] = Field(None, description="OWASP category")
    
    class Config:
        json_schema_extra = {
            "example": {
                "ai_summary": "Une vulnérabilité critique a été découverte...",
                "threat_type": "vulnerability",
                "severity": "critical",
                "mitre_tactic": "Initial Access",
                "owasp_category": "A06:2021-Vulnerable Components"
            }
        }
