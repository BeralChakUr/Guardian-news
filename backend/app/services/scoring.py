"""Scoring service for article prioritization"""
from datetime import datetime, timedelta
from typing import Dict, Any
import logging

from ..core.config import SEVERITY_WEIGHTS, SOURCE_RELIABILITY, SECTORS

logger = logging.getLogger(__name__)


class ScoringService:
    """Service for calculating article priority scores"""
    
    @staticmethod
    def calculate_recency_score(published_at: datetime) -> float:
        """
        Calculate recency score (0-1).
        More recent = higher score.
        """
        now = datetime.utcnow()
        age_hours = (now - published_at).total_seconds() / 3600
        
        if age_hours <= 1:
            return 1.0
        elif age_hours <= 6:
            return 0.9
        elif age_hours <= 24:
            return 0.7
        elif age_hours <= 48:
            return 0.5
        elif age_hours <= 168:  # 7 days
            return 0.3
        else:
            return 0.1
    
    @staticmethod
    def calculate_severity_score(severity: str) -> float:
        """Calculate severity score (0-1)."""
        weight = SEVERITY_WEIGHTS.get(severity.lower(), 1)
        return weight / 4.0
    
    @staticmethod
    def calculate_source_reliability(source: str) -> float:
        """Calculate source reliability score (0-1)."""
        return SOURCE_RELIABILITY.get(source, 0.5)
    
    @staticmethod
    def calculate_exploitability_score(attack_type: str, has_cve: bool = False) -> float:
        """Calculate exploitability score based on attack type."""
        high_exploitability = ["ransomware", "zero_day", "exploit", "apt"]
        medium_exploitability = ["phishing", "malware", "supply_chain"]
        
        base_score = 0.5
        if attack_type.lower() in high_exploitability:
            base_score = 0.9
        elif attack_type.lower() in medium_exploitability:
            base_score = 0.7
        
        if has_cve:
            base_score = min(1.0, base_score + 0.1)
        
        return base_score
    
    @staticmethod
    def calculate_sector_exposure(sector: str) -> float:
        """Calculate sector exposure score."""
        critical_sectors = ["Santé", "Énergie", "Finance", "Administration"]
        high_exposure = ["Industrie", "Transport", "Télécom"]
        
        if sector in critical_sectors:
            return 1.0
        elif sector in high_exposure:
            return 0.8
        elif sector in SECTORS:
            return 0.6
        return 0.4
    
    @classmethod
    def calculate_article_score(cls, article: Dict[str, Any]) -> float:
        """
        Calculate overall priority score for an article.
        
        Formula:
        score = (recency * 0.25) + (severity * 0.30) + 
                (source_reliability * 0.15) + (exploitability * 0.20) + 
                (sector_exposure * 0.10)
        
        Returns score between 0 and 100.
        """
        try:
            published_at = article.get("published_at")
            if isinstance(published_at, str):
                published_at = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
            elif published_at is None:
                published_at = datetime.utcnow()
            
            recency = cls.calculate_recency_score(published_at)
            severity = cls.calculate_severity_score(article.get("severity", "moyen"))
            source_reliability = cls.calculate_source_reliability(article.get("source", ""))
            
            content = f"{article.get('title', '')} {article.get('content', '')}".upper()
            has_cve = "CVE-" in content
            exploitability = cls.calculate_exploitability_score(
                article.get("attack_type", "other"),
                has_cve
            )
            
            sector_exposure = cls.calculate_sector_exposure(article.get("sector", ""))
            
            score = (
                recency * 0.25 +
                severity * 0.30 +
                source_reliability * 0.15 +
                exploitability * 0.20 +
                sector_exposure * 0.10
            )
            
            return round(score * 100, 2)
            
        except Exception as e:
            logger.error(f"Error calculating score: {e}")
            return 50.0


scoring_service = ScoringService()
