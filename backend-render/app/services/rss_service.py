"""RSS Ingestion Service - Fetches & classifies cybersecurity articles"""
import hashlib
import logging
import re
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional

import feedparser
import httpx
from bs4 import BeautifulSoup
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..core.config import (
    ARTICLE_MAX_AGE_DAYS,
    DEDUP_LOOKBACK_DAYS,
    MAX_ARTICLES_PER_FEED,
)
from ..core.text_utils import clean_utf8_text
from ..models.article import NewsArticle
from ..models.enums import Severity, ThreatType, ThreatLevel
from .sources import RSS_SOURCES

logger = logging.getLogger(__name__)


class RSSFetcherService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.http_client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        if self.http_client is None:
            self.http_client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        return self.http_client

    async def close(self):
        if self.http_client is not None:
            await self.http_client.aclose()
            self.http_client = None

    # ---------- Classification helpers ----------
    def classify_severity(self, title: str, content: str) -> Severity:
        text = (title + " " + content).lower()
        critical = ["critical", "critique", "zero-day", "0-day", "actively exploited",
                    "emergency", "urgence", "immediate", "cvss 9", "cvss 10"]
        high = ["high", "élevé", "ransomware", "data breach", "fuite", "exploit",
                "vulnerability", "vulnérabilité", "cve-", "patch now"]
        medium = ["medium", "moyen", "warning", "avertissement", "update", "mise à jour"]
        if any(k in text for k in critical):
            return Severity.CRITIQUE
        if any(k in text for k in high):
            return Severity.ELEVE
        if any(k in text for k in medium):
            return Severity.MOYEN
        return Severity.FAIBLE

    def classify_threat_type(self, title: str, content: str) -> ThreatType:
        text = (title + " " + content).lower()
        if any(k in text for k in ["phishing", "hameçonnage", "credential", "spear"]):
            return ThreatType.PHISHING
        if any(k in text for k in ["ransomware", "ransom", "rançon", "lockbit", "blackcat"]):
            return ThreatType.RANSOMWARE
        if any(k in text for k in ["malware", "trojan", "virus", "botnet", "spyware"]):
            return ThreatType.MALWARE
        if any(k in text for k in ["data breach", "leak", "fuite", "exposed", "stolen data"]):
            return ThreatType.DATA_LEAK
        if any(k in text for k in ["vulnerability", "vulnérabilité", "cve-", "exploit", "patch"]):
            return ThreatType.VULN
        if any(k in text for k in ["scam", "arnaque", "fraud", "fraude"]):
            return ThreatType.SCAM
        if any(k in text for k in ["apt", "nation-state", "state-sponsored"]):
            return ThreatType.APT
        if any(k in text for k in ["ddos", "denial of service"]):
            return ThreatType.DDOS
        return ThreatType.OTHER

    def classify_level(self, source_score: int, severity: Severity) -> ThreatLevel:
        if severity == Severity.CRITIQUE or source_score >= 9:
            return ThreatLevel.AVANCE
        if severity == Severity.ELEVE or source_score >= 7:
            return ThreatLevel.INTERMEDIAIRE
        return ThreatLevel.DEBUTANT

    def generate_tldr(self, title: str, content: str) -> List[str]:
        soup = BeautifulSoup(content, "html.parser")
        clean_text = soup.get_text(separator=" ", strip=True)
        sentences = re.split(r"[.!?]+", clean_text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
        tldr = []
        for s in sentences[:5]:
            if 30 < len(s) < 200:
                tldr.append(s[:150] + "..." if len(s) > 150 else s)
            if len(tldr) >= 3:
                break
        return tldr or [title]

    def generate_actions(self, threat_type: ThreatType, severity: Severity) -> List[str]:
        actions = {
            ThreatType.PHISHING: [
                "Ne cliquez pas sur les liens suspects",
                "Vérifiez l'expéditeur des emails",
                "Activez l'authentification à deux facteurs",
                "Signalez sur signal-spam.fr",
            ],
            ThreatType.RANSOMWARE: [
                "Vérifiez vos sauvegardes",
                "Mettez à jour vos systèmes",
                "Ne payez jamais la rançon",
                "Contactez un expert en cas d'infection",
            ],
            ThreatType.MALWARE: [
                "Lancez une analyse antivirus complète",
                "Mettez à jour votre antivirus",
                "Évitez les téléchargements non officiels",
            ],
            ThreatType.DATA_LEAK: [
                "Vérifiez vos comptes sur haveibeenpwned.com",
                "Changez vos mots de passe",
                "Activez la 2FA partout",
                "Surveillez vos comptes bancaires",
            ],
            ThreatType.VULN: [
                "Appliquez les correctifs de sécurité",
                "Mettez à jour vos systèmes",
                "Vérifiez si vous êtes affecté",
            ],
            ThreatType.SCAM: [
                "Ne communiquez jamais vos informations personnelles",
                "Vérifiez l'identité de l'interlocuteur",
                "Signalez sur internet-signalement.gouv.fr",
            ],
        }
        base = actions.get(threat_type, ["Restez vigilant", "Suivez les recommandations officielles"])
        if severity == Severity.CRITIQUE:
            base = ["⚠️ ACTION IMMÉDIATE REQUISE"] + base
        return base[:5]

    # ---------- Dedup helpers ----------
    def url_hash(self, url: str) -> str:
        return hashlib.md5(url.encode()).hexdigest()

    def title_similarity(self, t1: str, t2: str) -> float:
        w1 = set(t1.lower().split())
        w2 = set(t2.lower().split())
        if not w1 or not w2:
            return 0
        return len(w1 & w2) / max(len(w1), len(w2))

    async def is_duplicate(self, url: str, title: str) -> bool:
        url_h = self.url_hash(url)
        if await self.db.news.find_one({"url_hash": url_h}):
            return True
        lookback = datetime.utcnow() - timedelta(days=DEDUP_LOOKBACK_DAYS)
        recent = await self.db.news.find(
            {"published_at": {"$gte": lookback}}, {"title": 1}
        ).to_list(500)
        return any(self.title_similarity(title, a["title"]) > 0.7 for a in recent)

    # ---------- Fetching ----------
    async def fetch_feed(self, source: Dict) -> List[Dict]:
        try:
            client = await self.get_client()
            response = await client.get(source["url"])
            # CRITICAL: pass raw bytes to feedparser so it can detect encoding itself.
            # Passing response.text (already-decoded str) loses accented chars for some feeds.
            feed = feedparser.parse(response.content)
            articles = []
            for entry in feed.entries[:MAX_ARTICLES_PER_FEED]:
                title = clean_utf8_text(entry.get("title", ""))
                link = entry.get("link", "")
                content = clean_utf8_text(entry.get("summary", "") or entry.get("description", ""))
                published = entry.get("published_parsed") or entry.get("updated_parsed")
                pub_date = datetime(*published[:6]) if published else datetime.utcnow()
                if pub_date < datetime.utcnow() - timedelta(days=ARTICLE_MAX_AGE_DAYS):
                    continue
                articles.append({
                    "title": title, "url": link, "content": content,
                    "published_at": pub_date, "source": source["name"],
                    "source_score": source["score"],
                    "country": source.get("country", "US"),
                    "language": source.get("lang", "en"),
                    "priority": source.get("priority", 50),
                })
            logger.info(f"Fetched {len(articles)} articles from {source['name']}")
            return articles
        except Exception as e:
            logger.error(f"Error fetching {source['name']}: {e}")
            return []

    async def process_article(self, raw: Dict) -> Optional[NewsArticle]:
        if await self.is_duplicate(raw["url"], raw["title"]):
            return None
        severity = self.classify_severity(raw["title"], raw["content"])
        threat_type = self.classify_threat_type(raw["title"], raw["content"])
        level = self.classify_level(raw["source_score"], severity)
        tldr = self.generate_tldr(raw["title"], raw["content"])
        actions = self.generate_actions(threat_type, severity)
        impact = "Tous les utilisateurs" if severity in [Severity.CRITIQUE, Severity.ELEVE] else "Utilisateurs concernés"
        return NewsArticle(
            title=raw["title"], source=raw["source"], source_score=raw["source_score"],
            url=raw["url"], published_at=raw["published_at"],
            severity=severity, threat_type=threat_type, level=level,
            tldr=tldr, impact=impact, actions=actions,
            content=raw["content"][:1000],
            url_hash=self.url_hash(raw["url"]),
            country=raw.get("country", "US"),
            language=raw.get("language", "en"),
            priority=raw.get("priority", 50),
            attack_type=threat_type.value,
        )

    async def run_ingestion(self) -> int:
        logger.info("Starting RSS ingestion...")
        tasks = [self.fetch_feed(s) for s in RSS_SOURCES]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_articles: List[Dict] = []
        for r in results:
            if isinstance(r, list):
                all_articles.extend(r)
        logger.info(f"Total raw articles fetched: {len(all_articles)}")
        saved = 0
        for raw in all_articles:
            article = await self.process_article(raw)
            if article:
                await self.db.news.update_one(
                    {"url_hash": article.url_hash},
                    {"$set": article.dict()}, upsert=True,
                )
                saved += 1
        logger.info(f"Saved {saved} new articles")
        await self.update_tension()
        return saved

    async def update_tension(self):
        """Calculate weighted 7-day tension score"""
        now = datetime.utcnow()
        start = now - timedelta(days=7)
        critical = await self.db.news.count_documents({"published_at": {"$gte": start}, "severity": "critique"})
        high = await self.db.news.count_documents({"published_at": {"$gte": start}, "severity": "eleve"})
        medium = await self.db.news.count_documents({"published_at": {"$gte": start}, "severity": "moyen"})
        low = await self.db.news.count_documents({"published_at": {"$gte": start}, "severity": "faible"})
        recent = await self.db.news.find(
            {"published_at": {"$gte": start}}, {"title": 1}
        ).sort("published_at", -1).limit(5).to_list(5)
        recent_threats = [a["title"][:50] for a in recent]
        total = critical + high + medium + low
        if total > 0:
            weighted = (critical * 4) + (high * 3) + (medium * 2) + (low * 1)
            score = min(100, int((weighted / total) * 25))
        else:
            score = 0
        if score >= 70 or critical >= 3:
            level = "Critique"
            reason = f"{critical} alertes critiques et {high} alertes élevées sur 7 jours"
        elif score >= 50 or critical >= 1:
            level = "Élevé"
            reason = f"{high} menaces importantes détectées cette semaine"
        elif score >= 30:
            level = "Modéré"
            reason = "Activité normale avec vigilance requise"
        else:
            level = "Faible"
            reason = "Situation calme"
        await self.db.tension.update_one(
            {"_id": "current"},
            {"$set": {
                "level": level, "score": score, "reason": reason,
                "critical_count": critical, "high_count": high,
                "medium_count": medium, "low_count": low,
                "total_7days": total, "recent_threats": recent_threats,
                "updated_at": now,
            }}, upsert=True,
        )
        logger.info(f"Tension updated: {level} (score: {score}, total 7d: {total})")

    async def migrate_country_data(self):
        """Ensure all articles have correct country/priority/language based on source"""
        logger.info("Running country data migration...")
        source_data = {s["name"]: {"country": s["country"], "priority": s["priority"], "language": s.get("lang", "en")} for s in RSS_SOURCES}
        total_updated = 0
        for name, data in source_data.items():
            result = await self.db.news.update_many(
                {"source": name, "$or": [
                    {"country": {"$ne": data["country"]}},
                    {"priority": {"$ne": data["priority"]}},
                ]},
                {"$set": data},
            )
            if result.modified_count:
                total_updated += result.modified_count
        logger.info(f"Country migration: {total_updated} articles updated")
        return total_updated
