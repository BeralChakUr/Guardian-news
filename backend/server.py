from fastapi import FastAPI, APIRouter, Query, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import feedparser
import httpx
import asyncio
import hashlib
import re
import html
from bs4 import BeautifulSoup
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# UTF-8 text cleaning utilities
def clean_utf8_text(text: str) -> str:
    """Clean and normalize UTF-8 text to fix encoding issues"""
    if not text:
        return ""
    try:
        # Decode HTML entities
        text = html.unescape(text)
        # Fix common encoding issues (mojibake)
        try:
            # Try to fix double-encoded UTF-8
            text = text.encode('latin1').decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass
        # Normalize unicode characters
        import unicodedata
        text = unicodedata.normalize('NFC', text)
        # Remove null bytes and control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
        return text.strip()
    except Exception:
        return text

# Optional AI integration - gracefully handle if not available
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    LlmChat = None
    UserMessage = None
    EMERGENT_AVAILABLE = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Emergent LLM Key (only used if emergentintegrations is available)
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'guardian_news')

# Enums
class Severity(str, Enum):
    CRITIQUE = "critique"
    ELEVE = "eleve"
    MOYEN = "moyen"
    FAIBLE = "faible"

class ThreatType(str, Enum):
    PHISHING = "phishing"
    RANSOMWARE = "ransomware"
    MALWARE = "malware"
    DATA_LEAK = "data_leak"
    VULN = "vuln"
    SCAM = "scam"
    APT = "apt"
    DDOS = "ddos"
    OTHER = "other"

class ThreatLevel(str, Enum):
    DEBUTANT = "debutant"
    INTERMEDIAIRE = "intermediaire"
    AVANCE = "avance"

class Audience(str, Enum):
    PARTICULIERS = "particuliers"
    ENTREPRISES = "entreprises"
    SECTEUR_PUBLIC = "secteur_public"
    TOUS = "tous"

# RSS Sources with trust scores
RSS_SOURCES = [
    # 🇫🇷 FRANCE - Priority 100 (highest)
    {"name": "CERT-FR", "url": "https://www.cert.ssi.gouv.fr/feed/", "score": 10, "lang": "fr", "country": "FR", "type": "institution", "priority": 100},
    {"name": "ANSSI", "url": "https://www.ssi.gouv.fr/feed/actualite/", "score": 10, "lang": "fr", "country": "FR", "type": "institution", "priority": 100},
    {"name": "Cybermalveillance.gouv", "url": "https://www.cybermalveillance.gouv.fr/feed/", "score": 9, "lang": "fr", "country": "FR", "type": "institution", "priority": 95},
    {"name": "Sekoia", "url": "https://blog.sekoia.io/feed/", "score": 8, "lang": "fr", "country": "FR", "type": "company", "priority": 80},
    {"name": "Global Security Mag", "url": "https://www.globalsecuritymag.fr/spip.php?page=backend", "score": 7, "lang": "fr", "country": "FR", "type": "media", "priority": 70},
    {"name": "Le Monde Informatique", "url": "https://www.lemondeinformatique.fr/flux-rss/thematique/securite/rss.xml", "score": 7, "lang": "fr", "country": "FR", "type": "media", "priority": 70},
    
    # 🇺🇸 USA / International - Priority 50
    {"name": "CISA", "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml", "score": 10, "lang": "en", "country": "US", "type": "institution", "priority": 50},
    {"name": "The Hacker News", "url": "https://feeds.feedburner.com/TheHackersNews", "score": 7, "lang": "en", "country": "US", "type": "media", "priority": 40},
    {"name": "BleepingComputer", "url": "https://www.bleepingcomputer.com/feed/", "score": 8, "lang": "en", "country": "US", "type": "media", "priority": 45},
    {"name": "Dark Reading", "url": "https://www.darkreading.com/rss.xml", "score": 7, "lang": "en", "country": "US", "type": "media", "priority": 40},
    {"name": "SecurityWeek", "url": "https://feeds.feedburner.com/securityweek", "score": 7, "lang": "en", "country": "US", "type": "media", "priority": 40},
    {"name": "Krebs on Security", "url": "https://krebsonsecurity.com/feed/", "score": 8, "lang": "en", "country": "US", "type": "independent", "priority": 45},
    {"name": "Cisco Talos", "url": "https://blog.talosintelligence.com/feeds/posts/default", "score": 9, "lang": "en", "country": "US", "type": "company", "priority": 48},
    {"name": "Malwarebytes Labs", "url": "https://blog.malwarebytes.com/feed/", "score": 8, "lang": "en", "country": "US", "type": "company", "priority": 45},
    {"name": "Microsoft Security", "url": "https://www.microsoft.com/en-us/security/blog/feed/", "score": 9, "lang": "en", "country": "US", "type": "company", "priority": 48},
]

# Source country lookup
SOURCE_COUNTRIES = {source["name"]: source["country"] for source in RSS_SOURCES}
SOURCE_PRIORITIES = {source["name"]: source["priority"] for source in RSS_SOURCES}

# French Cybersecurity Ecosystem Organizations
FRENCH_CYBER_ECOSYSTEM = [
    {"id": "cert-fr", "name": "CERT-FR", "type": "Institution", "url": "https://www.cert.ssi.gouv.fr/", "description": "Centre gouvernemental de veille et d'alerte"},
    {"id": "anssi", "name": "ANSSI", "type": "Institution", "url": "https://www.ssi.gouv.fr/", "description": "Agence nationale de la sécurité des systèmes d'information"},
    {"id": "cnil", "name": "CNIL", "type": "Institution", "url": "https://www.cnil.fr/", "description": "Commission nationale de l'informatique et des libertés"},
    {"id": "cybermalveillance", "name": "Cybermalveillance.gouv", "type": "Institution", "url": "https://www.cybermalveillance.gouv.fr/", "description": "Assistance et prévention en sécurité numérique"},
    {"id": "synacktiv", "name": "Synacktiv", "type": "Entreprise", "url": "https://www.synacktiv.com/", "description": "Offensive security et pentesting"},
    {"id": "sekoia", "name": "Sekoia", "type": "Entreprise", "url": "https://www.sekoia.io/", "description": "Threat Intelligence et XDR"},
    {"id": "yeswehack", "name": "YesWeHack", "type": "Entreprise", "url": "https://www.yeswehack.com/", "description": "Bug Bounty européen"},
    {"id": "stormshield", "name": "Stormshield", "type": "Entreprise", "url": "https://www.stormshield.com/", "description": "Solutions de cybersécurité souveraines"},
    {"id": "orange-cyber", "name": "Orange Cyberdefense", "type": "Entreprise", "url": "https://www.orangecyberdefense.com/", "description": "Services de cybersécurité managés"},
    {"id": "advens", "name": "Advens", "type": "Entreprise", "url": "https://www.advens.fr/", "description": "SOC et services de sécurité"},
]

# Pydantic Models
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
    country: str = "US"  # FR or US
    language: str = "en"  # fr or en
    priority: int = 50

class NewsResponse(BaseModel):
    items: List[NewsArticle]
    total: int
    page: int
    page_size: int
    has_more: bool

class TensionResponse(BaseModel):
    level: str
    score: int
    reason: str
    critical_count: int
    high_count: int
    medium_count: int = 0
    low_count: int = 0
    total_7days: int = 0
    recent_threats: List[str]
    updated_at: datetime

# AI Summary Models
class SummaryMode(str, Enum):
    SIMPLE = "simple"
    EXECUTIVE = "executive"
    ANALYST = "analyst"

class AISummaryRequest(BaseModel):
    mode: SummaryMode = SummaryMode.SIMPLE
    article_ids: Optional[List[str]] = None
    limit: int = 5

class AISummaryItem(BaseModel):
    article_id: str
    title_fr: str
    summary: str
    threat_type: str
    severity: str
    source: str
    link: str
    key_info: Optional[str] = None
    action: Optional[str] = None

class AISummaryResponse(BaseModel):
    mode: str
    generated_at: datetime
    items: List[AISummaryItem]
    global_summary: str

# RSS Fetcher Service
class RSSFetcherService:
    def __init__(self, db):
        self.db = db
        self.http_client = None
    
    async def get_client(self):
        if self.http_client is None:
            self.http_client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        return self.http_client
    
    def classify_severity(self, title: str, content: str) -> Severity:
        """Classify severity based on keywords"""
        text = (title + " " + content).lower()
        
        critical_keywords = ["critical", "critique", "zero-day", "0-day", "actively exploited", 
                           "emergency", "urgence", "immediate", "cvss 9", "cvss 10"]
        high_keywords = ["high", "élevé", "ransomware", "data breach", "fuite", "exploit",
                        "vulnerability", "vulnérabilité", "cve-", "patch now"]
        medium_keywords = ["medium", "moyen", "warning", "avertissement", "update", "mise à jour"]
        
        for kw in critical_keywords:
            if kw in text:
                return Severity.CRITIQUE
        for kw in high_keywords:
            if kw in text:
                return Severity.ELEVE
        for kw in medium_keywords:
            if kw in text:
                return Severity.MOYEN
        return Severity.FAIBLE
    
    def classify_threat_type(self, title: str, content: str) -> ThreatType:
        """Classify threat type based on keywords"""
        text = (title + " " + content).lower()
        
        if any(kw in text for kw in ["phishing", "hameçonnage", "credential", "spear"]):
            return ThreatType.PHISHING
        if any(kw in text for kw in ["ransomware", "ransom", "rançon", "lockbit", "blackcat"]):
            return ThreatType.RANSOMWARE
        if any(kw in text for kw in ["malware", "trojan", "virus", "botnet", "spyware"]):
            return ThreatType.MALWARE
        if any(kw in text for kw in ["data breach", "leak", "fuite", "exposed", "stolen data"]):
            return ThreatType.DATA_LEAK
        if any(kw in text for kw in ["vulnerability", "vulnérabilité", "cve-", "exploit", "patch"]):
            return ThreatType.VULN
        if any(kw in text for kw in ["scam", "arnaque", "fraud", "fraude"]):
            return ThreatType.SCAM
        if any(kw in text for kw in ["apt", "nation-state", "state-sponsored"]):
            return ThreatType.APT
        if any(kw in text for kw in ["ddos", "denial of service"]):
            return ThreatType.DDOS
        return ThreatType.OTHER
    
    def classify_level(self, source_score: int, severity: Severity) -> ThreatLevel:
        """Classify technical level"""
        if severity == Severity.CRITIQUE or source_score >= 9:
            return ThreatLevel.AVANCE
        if severity == Severity.ELEVE or source_score >= 7:
            return ThreatLevel.INTERMEDIAIRE
        return ThreatLevel.DEBUTANT
    
    def generate_tldr(self, title: str, content: str) -> List[str]:
        """Generate TL;DR bullet points from content"""
        # Clean HTML
        soup = BeautifulSoup(content, 'html.parser')
        clean_text = soup.get_text(separator=' ', strip=True)
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', clean_text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
        
        # Take first 3 meaningful sentences
        tldr = []
        for s in sentences[:5]:
            if len(s) > 30 and len(s) < 200:
                tldr.append(s[:150] + "..." if len(s) > 150 else s)
            if len(tldr) >= 3:
                break
        
        if not tldr:
            tldr = [title]
        
        return tldr
    
    def generate_actions(self, threat_type: ThreatType, severity: Severity) -> List[str]:
        """Generate recommended actions based on threat type"""
        actions = {
            ThreatType.PHISHING: [
                "Ne cliquez pas sur les liens suspects",
                "Vérifiez l'expéditeur des emails",
                "Activez l'authentification à deux facteurs",
                "Signalez sur signal-spam.fr"
            ],
            ThreatType.RANSOMWARE: [
                "Vérifiez vos sauvegardes",
                "Mettez à jour vos systèmes",
                "Ne payez jamais la rançon",
                "Contactez un expert en cas d'infection"
            ],
            ThreatType.MALWARE: [
                "Lancez une analyse antivirus complète",
                "Mettez à jour votre antivirus",
                "Évitez les téléchargements non officiels"
            ],
            ThreatType.DATA_LEAK: [
                "Vérifiez vos comptes sur haveibeenpwned.com",
                "Changez vos mots de passe",
                "Activez la 2FA partout",
                "Surveillez vos comptes bancaires"
            ],
            ThreatType.VULN: [
                "Appliquez les correctifs de sécurité",
                "Mettez à jour vos systèmes",
                "Vérifiez si vous êtes affecté"
            ],
            ThreatType.SCAM: [
                "Ne communiquez jamais vos informations personnelles",
                "Vérifiez l'identité de l'interlocuteur",
                "Signalez sur internet-signalement.gouv.fr"
            ]
        }
        
        base_actions = actions.get(threat_type, ["Restez vigilant", "Suivez les recommandations officielles"])
        
        if severity == Severity.CRITIQUE:
            base_actions.insert(0, "⚠️ ACTION IMMÉDIATE REQUISE")
        
        return base_actions[:5]
    
    def url_hash(self, url: str) -> str:
        """Generate hash from URL for deduplication"""
        return hashlib.md5(url.encode()).hexdigest()
    
    def title_similarity(self, title1: str, title2: str) -> float:
        """Calculate simple title similarity"""
        words1 = set(title1.lower().split())
        words2 = set(title2.lower().split())
        if not words1 or not words2:
            return 0
        intersection = words1.intersection(words2)
        return len(intersection) / max(len(words1), len(words2))
    
    async def fetch_feed(self, source: Dict) -> List[Dict]:
        """Fetch and parse a single RSS feed"""
        try:
            client = await self.get_client()
            response = await client.get(source["url"])
            
            # Ensure proper encoding for feed parsing
            content = response.text
            feed = feedparser.parse(content)
            
            articles = []
            for entry in feed.entries[:20]:  # Limit per source
                title = clean_utf8_text(entry.get("title", ""))
                link = entry.get("link", "")
                content = clean_utf8_text(entry.get("summary", "") or entry.get("description", ""))
                
                # Parse published date
                published = entry.get("published_parsed") or entry.get("updated_parsed")
                if published:
                    pub_date = datetime(*published[:6])
                else:
                    pub_date = datetime.utcnow()
                
                # Skip old articles (> 7 days)
                if pub_date < datetime.utcnow() - timedelta(days=7):
                    continue
                
                articles.append({
                    "title": title,
                    "url": link,
                    "content": content,
                    "published_at": pub_date,
                    "source": source["name"],
                    "source_score": source["score"],
                    "country": source.get("country", "US"),
                    "language": source.get("lang", "en"),
                    "priority": source.get("priority", 50)
                })
            
            logger.info(f"Fetched {len(articles)} articles from {source['name']}")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching {source['name']}: {e}")
            return []
    
    async def is_duplicate(self, url: str, title: str) -> bool:
        """Check if article is duplicate"""
        url_h = self.url_hash(url)
        
        # Check exact URL match
        existing = await self.db.news.find_one({"url_hash": url_h})
        if existing:
            return True
        
        # Check similar titles from last 3 days
        three_days_ago = datetime.utcnow() - timedelta(days=3)
        recent_articles = await self.db.news.find(
            {"published_at": {"$gte": three_days_ago}},
            {"title": 1}
        ).to_list(500)
        
        for article in recent_articles:
            if self.title_similarity(title, article["title"]) > 0.7:
                return True
        
        return False
    
    async def process_article(self, raw_article: Dict) -> Optional[NewsArticle]:
        """Process and classify a raw article"""
        if await self.is_duplicate(raw_article["url"], raw_article["title"]):
            return None
        
        severity = self.classify_severity(raw_article["title"], raw_article["content"])
        threat_type = self.classify_threat_type(raw_article["title"], raw_article["content"])
        level = self.classify_level(raw_article["source_score"], severity)
        tldr = self.generate_tldr(raw_article["title"], raw_article["content"])
        actions = self.generate_actions(threat_type, severity)
        
        # Generate impact description
        impact = "Tous les utilisateurs" if severity in [Severity.CRITIQUE, Severity.ELEVE] else "Utilisateurs concernés"
        
        return NewsArticle(
            title=raw_article["title"],
            source=raw_article["source"],
            source_score=raw_article["source_score"],
            url=raw_article["url"],
            published_at=raw_article["published_at"],
            severity=severity,
            threat_type=threat_type,
            level=level,
            tldr=tldr,
            impact=impact,
            actions=actions,
            content=raw_article["content"][:1000],
            url_hash=self.url_hash(raw_article["url"]),
            country=raw_article.get("country", "US"),
            language=raw_article.get("language", "en"),
            priority=raw_article.get("priority", 50)
        )
    
    async def run_ingestion(self):
        """Run full RSS ingestion process"""
        logger.info("Starting RSS ingestion...")
        
        # Fetch all feeds concurrently
        tasks = [self.fetch_feed(source) for source in RSS_SOURCES]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten results
        all_articles = []
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)
        
        logger.info(f"Total raw articles fetched: {len(all_articles)}")
        
        # Process and save articles
        saved_count = 0
        for raw_article in all_articles:
            article = await self.process_article(raw_article)
            if article:
                await self.db.news.update_one(
                    {"url_hash": article.url_hash},
                    {"$set": article.dict()},
                    upsert=True
                )
                saved_count += 1
        
        logger.info(f"Saved {saved_count} new articles")
        
        # Update tension index
        await self.update_tension()
        
        return saved_count
    
    async def update_tension(self):
        """Calculate and update cyber tension index based on 7-day data"""
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        
        # Count incidents by severity over the last 7 days
        critical_count = await self.db.news.count_documents({
            "published_at": {"$gte": seven_days_ago},
            "severity": "critique"
        })
        
        high_count = await self.db.news.count_documents({
            "published_at": {"$gte": seven_days_ago},
            "severity": "eleve"
        })
        
        medium_count = await self.db.news.count_documents({
            "published_at": {"$gte": seven_days_ago},
            "severity": "moyen"
        })
        
        low_count = await self.db.news.count_documents({
            "published_at": {"$gte": seven_days_ago},
            "severity": "faible"
        })
        
        # Get recent threat titles
        recent = await self.db.news.find(
            {"published_at": {"$gte": seven_days_ago}},
            {"threat_type": 1, "title": 1}
        ).sort("published_at", -1).limit(10).to_list(10)
        
        recent_threats = [a["title"][:50] for a in recent[:5]]
        
        # Calculate weighted score using the formula:
        # score = ((critique * 4) + (élevé * 3) + (moyen * 2) + (faible * 1)) / total * 25
        # Then normalized to 100
        total = critical_count + high_count + medium_count + low_count
        
        if total > 0:
            weighted_sum = (critical_count * 4) + (high_count * 3) + (medium_count * 2) + (low_count * 1)
            raw_score = (weighted_sum / total) * 25  # Scale to 0-100 range
            score = min(100, int(raw_score))
        else:
            score = 0
        
        # Determine level based on score
        if score >= 70 or critical_count >= 3:
            level = "Critique"
            reason = f"{critical_count} alertes critiques et {high_count} alertes élevées sur 7 jours"
        elif score >= 50 or critical_count >= 1:
            level = "Élevé"
            reason = f"{high_count} menaces importantes détectées cette semaine"
        elif score >= 30:
            level = "Modéré"
            reason = "Activité normale avec vigilance requise"
        else:
            level = "Faible"
            reason = "Situation calme"
        
        tension_data = {
            "level": level,
            "score": score,
            "reason": reason,
            "critical_count": critical_count,
            "high_count": high_count,
            "medium_count": medium_count,
            "low_count": low_count,
            "total_7days": total,
            "recent_threats": recent_threats,
            "updated_at": now
        }
        
        await self.db.tension.update_one(
            {"_id": "current"},
            {"$set": tension_data},
            upsert=True
        )
        
        logger.info(f"Tension updated: {level} (score: {score}, total 7d: {total})")

# Global instances
client = None
db = None
rss_service = None
scheduler = None

async def migrate_country_data(database):
    """Migrate existing articles to add country data based on source name"""
    logger.info("Starting country data migration...")
    
    # Map sources to their country data
    source_to_country = {s["name"]: {"country": s["country"], "priority": s["priority"], "language": s.get("lang", "en")} for s in RSS_SOURCES}
    
    # Force update all articles based on their source - even if country already exists
    # This ensures French sources are correctly tagged
    updated_total = 0
    for source_name, data in source_to_country.items():
        # Update all articles from this source, even if country is already set
        result = await database.news.update_many(
            {"source": source_name, "$or": [
                {"country": {"$ne": data["country"]}},
                {"priority": {"$ne": data["priority"]}}
            ]},
            {"$set": {"country": data["country"], "priority": data["priority"], "language": data["language"]}}
        )
        if result.modified_count > 0:
            logger.info(f"Updated {result.modified_count} articles from {source_name} to country={data['country']}, priority={data['priority']}")
            updated_total += result.modified_count
    
    if updated_total == 0:
        logger.info("All articles already have correct country data")
    else:
        logger.info(f"Country data migration completed: {updated_total} articles updated")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, rss_service, scheduler
    
    # Startup
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    rss_service = RSSFetcherService(db)
    
    # Create indexes
    await db.news.create_index([("published_at", -1)])
    await db.news.create_index([("url_hash", 1)], unique=True)
    await db.news.create_index([("severity", 1)])
    await db.news.create_index([("threat_type", 1)])
    await db.news.create_index([("country", 1)])
    await db.news.create_index([("priority", -1), ("published_at", -1)])
    
    # Update existing articles with country data based on source
    await migrate_country_data(db)
    
    # Setup scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        rss_service.run_ingestion,
        IntervalTrigger(minutes=30),
        id="rss_ingestion",
        replace_existing=True
    )
    scheduler.start()
    
    # Run initial ingestion
    logger.info("Running initial RSS ingestion...")
    asyncio.create_task(rss_service.run_ingestion())
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    if rss_service.http_client:
        await rss_service.http_client.aclose()
    client.close()

# Create app with lifespan
app = FastAPI(
    title="Guardian News API",
    description="Cybersecurity News Intelligence API",
    version="2.0.0",
    lifespan=lifespan
)

# UTF-8 Response Middleware
class UTF8ResponseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Ensure UTF-8 charset for JSON responses
        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type and "charset" not in content_type:
            response.headers["content-type"] = "application/json; charset=utf-8"
        return response

app.add_middleware(UTF8ResponseMiddleware)

# ============== ROOT & HEALTH ENDPOINTS ==============

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {"message": "Guardian News API is running"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Render"""
    return {"status": "ok"}

# Router
api_router = APIRouter(prefix="/api/v1")

# ============== NEWS ENDPOINTS ==============

@api_router.get("/news", response_model=NewsResponse)
async def get_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=50),
    severity: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None, alias="type"),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None, description="Filter by country code (FR, US, etc.)"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
):
    """Get paginated news articles with filters"""
    
    # Build filter
    filter_query = {}
    
    if severity:
        filter_query["severity"] = severity
    if threat_type:
        filter_query["threat_type"] = threat_type
    if level:
        filter_query["level"] = level
    if country:
        filter_query["country"] = country.upper()
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    
    # Date filters
    if date_from or date_to:
        date_filter = {}
        if date_from and isinstance(date_from, str):
            try:
                from_date = datetime.strptime(date_from, "%Y-%m-%d")
                date_filter["$gte"] = from_date
            except ValueError:
                pass
        if date_to and isinstance(date_to, str):
            try:
                to_date = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)  # Include the entire day
                date_filter["$lt"] = to_date
            except ValueError:
                pass
        if date_filter:
            filter_query["published_at"] = date_filter
    
    # Get total count
    total = await db.news.count_documents(filter_query)
    
    # Pagination
    skip = (page - 1) * page_size
    
    # Fetch articles - sort by date DESC, then by severity (critique > eleve > moyen > faible)
    # Severity order mapping: critique=4, eleve=3, moyen=2, faible=1
    cursor = db.news.find(filter_query).sort([("published_at", -1)]).skip(skip).limit(page_size)
    articles = await cursor.to_list(page_size)
    
    # Convert to response and sort by severity if same date
    items = [NewsArticle(**article) for article in articles]
    
    # Secondary sort by severity (for same-date articles)
    severity_order = {"critique": 0, "eleve": 1, "moyen": 2, "faible": 3}
    items.sort(key=lambda x: (x.published_at.date(), severity_order.get(x.severity, 4)), reverse=False)
    items.sort(key=lambda x: x.published_at, reverse=True)
    
    return NewsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(skip + len(items)) < total
    )

@api_router.get("/news/tension", response_model=TensionResponse)
async def get_tension():
    """Get current cyber tension index"""
    tension = await db.tension.find_one({"_id": "current"})
    
    if not tension:
        # Return default if not yet calculated
        return TensionResponse(
            level="Modéré",
            score=30,
            reason="Calcul en cours...",
            critical_count=0,
            high_count=0,
            recent_threats=[],
            updated_at=datetime.utcnow()
        )
    
    return TensionResponse(
        level=tension["level"],
        score=tension["score"],
        reason=tension["reason"],
        critical_count=tension["critical_count"],
        high_count=tension["high_count"],
        medium_count=tension.get("medium_count", 0),
        low_count=tension.get("low_count", 0),
        total_7days=tension.get("total_7days", 0),
        recent_threats=tension["recent_threats"],
        updated_at=tension["updated_at"]
    )

@api_router.get("/news/{news_id}")
async def get_news_detail(news_id: str):
    """Get single news article by ID"""
    article = await db.news.find_one({"id": news_id})
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return NewsArticle(**article)

@api_router.post("/news/refresh")
async def trigger_refresh(background_tasks: BackgroundTasks):
    """Manually trigger RSS refresh"""
    background_tasks.add_task(rss_service.run_ingestion)
    return {"message": "Refresh started", "status": "processing"}

# ============== AI SUMMARY ENDPOINT ==============

AI_SUMMARY_SYSTEM_PROMPT = """Tu es un analyste en cybersécurité spécialisé dans l'intelligence des menaces.

Ta mission est de lire des articles de cybersécurité et de produire un résumé clair et précis en français.

Le résumé doit être concis, factuel et compréhensible par des professionnels IT et le grand public.

Tu dois :
1. Créer un titre court en français
2. Rédiger un résumé de 2-4 phrases
3. Identifier le type de menace (phishing, ransomware, vulnérabilité, malware, fuite de données, etc.)
4. Évaluer la gravité (critique, élevée, moyenne, faible)
5. Extraire les informations techniques clés si présentes
6. Suggérer une action de vigilance

N'invente pas d'information. Garde toujours le lien original."""

async def generate_ai_summary(articles: List[Dict], mode: str) -> Dict:
    """Generate AI summary using Emergent LLM or fallback to mock data"""
    
    # Check if AI integration is available
    if not EMERGENT_AVAILABLE or not EMERGENT_LLM_KEY:
        logging.info("AI integration not available, using fallback summary")
        return generate_fallback_summary(articles)
    
    try:
        import json
        
        # Prepare context for AI
        articles_text = ""
        for idx, article in enumerate(articles, 1):
            tldr = article.get('tldr', article.get('title', ''))
            if isinstance(tldr, list):
                tldr = " ".join(tldr)
            articles_text += f"""
Article {idx}:
Titre: {article.get('title', 'N/A')}
Source: {article.get('source', 'N/A')}
Lien: {article.get('url', 'N/A')}
Contenu: {tldr[:500]}
---
"""
        
        # Adjust prompt based on mode
        mode_instruction = {
            "simple": "Génère un résumé très simple de 2 phrases maximum, accessible au grand public.",
            "executive": "Génère un résumé stratégique pour les décideurs, focus sur l'impact business et les risques.",
            "analyst": "Génère un résumé technique détaillé pour les analystes sécurité, avec IOCs et recommandations techniques."
        }
        
        user_prompt = f"""Analyse ces articles de cybersécurité et génère un résumé en français.

Mode: {mode_instruction.get(mode, mode_instruction['simple'])}

{articles_text}

Réponds au format JSON strict:
{{
    "global_summary": "Résumé global de la situation cyber actuelle en 2-3 phrases",
    "items": [
        {{
            "title_fr": "Titre traduit en français",
            "summary": "Résumé de l'article",
            "threat_type": "phishing|ransomware|vulnérabilité|malware|fuite de données|ddos|autre",
            "severity": "critique|élevée|moyenne|faible",
            "key_info": "Information technique clé (optionnel)",
            "action": "Action recommandée"
        }}
    ]
}}"""

        # Create LlmChat instance with correct parameters
        session_id = f"ai_summary_{hashlib.md5(articles_text.encode()).hexdigest()[:8]}"
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=AI_SUMMARY_SYSTEM_PROMPT
        )
        
        # Use UserMessage for the request
        user_message = UserMessage(text=user_prompt)
        response = await llm.send_message(user_message)
        
        # Parse JSON response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
            return result
        else:
            raise ValueError("No valid JSON in response")
            
    except Exception as e:
        logging.error(f"AI Summary error: {e}")
        return generate_fallback_summary(articles)


def generate_fallback_summary(articles: List[Dict]) -> Dict:
    """Generate a fallback summary when AI is not available"""
    return {
            "global_summary": "Résumé automatique indisponible. Veuillez consulter les articles individuellement.",
            "items": [
                {
                    "title_fr": article.get('title', 'Article'),
                    "summary": " ".join(article.get('tldr', ['Aucun résumé disponible'])) if isinstance(article.get('tldr'), list) else article.get('tldr', 'Aucun résumé disponible'),
                    "threat_type": article.get('threat_type', 'autre'),
                    "severity": article.get('severity', 'moyenne'),
                    "key_info": None,
                    "action": "Consultez la source pour plus d'informations"
                }
                for article in articles[:5]
            ]
        }

@api_router.post("/news/ai-summary", response_model=AISummaryResponse)
async def get_ai_summary(request: AISummaryRequest):
    """Generate AI-powered threat intelligence summary"""
    
    # Get articles to summarize
    if request.article_ids:
        # Get specific articles
        articles = []
        for aid in request.article_ids[:request.limit]:
            article = await db.news.find_one({"id": aid})
            if article:
                articles.append(article)
    else:
        # Get latest articles
        cursor = db.news.find().sort("published_at", -1).limit(request.limit)
        articles = await cursor.to_list(length=request.limit)
    
    if not articles:
        raise HTTPException(status_code=404, detail="No articles found")
    
    # Check cache
    cache_key = f"ai_summary_{request.mode}_{hashlib.md5(str([a['id'] for a in articles]).encode()).hexdigest()}"
    cached = await db.ai_summaries.find_one({"_id": cache_key})
    
    if cached and (datetime.utcnow() - cached.get("generated_at", datetime.min)) < timedelta(hours=1):
        # Return cached summary
        return AISummaryResponse(
            mode=request.mode.value,
            generated_at=cached["generated_at"],
            items=[AISummaryItem(**item) for item in cached["items"]],
            global_summary=cached["global_summary"]
        )
    
    # Generate new summary
    ai_result = await generate_ai_summary(articles, request.mode.value)
    
    # Build response
    items = []
    for idx, article in enumerate(articles):
        ai_item = ai_result.get("items", [{}])[idx] if idx < len(ai_result.get("items", [])) else {}
        
        # Handle tldr as list or string
        tldr = article.get("tldr", "Aucun résumé")
        if isinstance(tldr, list):
            tldr = " ".join(tldr) if tldr else "Aucun résumé"
        
        summary_text = ai_item.get("summary")
        if isinstance(summary_text, list):
            summary_text = " ".join(summary_text) if summary_text else tldr
        elif not summary_text:
            summary_text = tldr
            
        items.append(AISummaryItem(
            article_id=article["id"],
            title_fr=ai_item.get("title_fr", article["title"]),
            summary=summary_text,
            threat_type=ai_item.get("threat_type", article.get("threat_type", "autre")),
            severity=ai_item.get("severity", article.get("severity", "moyenne")),
            source=article["source"],
            link=article["url"],
            key_info=ai_item.get("key_info"),
            action=ai_item.get("action")
        ))
    
    response = AISummaryResponse(
        mode=request.mode.value,
        generated_at=datetime.utcnow(),
        items=items,
        global_summary=ai_result.get("global_summary", "Analyse en cours...")
    )
    
    # Cache the result
    await db.ai_summaries.update_one(
        {"_id": cache_key},
        {"$set": {
            "generated_at": response.generated_at,
            "items": [item.dict() for item in items],
            "global_summary": response.global_summary
        }},
        upsert=True
    )
    
    return response

# ============== LEGACY ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "Guardian News API v2.0", "status": "online"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Include router
app.include_router(api_router)

# Also keep /api prefix for backward compatibility
# ============== DASHBOARD API ROUTES ==============

dashboard_router = APIRouter(prefix="/api/dashboard")

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

@dashboard_router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """Get dashboard metrics summary"""
    # Get tension data
    tension = await db.tension.find_one({"_id": "current"})
    
    # Count articles
    total_articles = await db.news.count_documents({})
    
    # Count critical vulnerabilities
    critical_vulns = await db.news.count_documents({
        "severity": "critique",
        "threat_type": "vuln"
    })
    
    # Get unique sources
    sources = await db.news.distinct("source")
    
    return DashboardMetrics(
        threat_level=tension.get("level", "Modéré") if tension else "Modéré",
        score=tension.get("score", 30) if tension else 30,
        active_alerts=total_articles,
        critical_vulnerabilities=critical_vulns,
        monitored_sources=len(sources) if sources else len(RSS_SOURCES)
    )

@dashboard_router.get("/radar", response_model=RadarResponse)
async def get_dashboard_radar():
    """Get threat radar data by category"""
    # Define category mappings
    category_mapping = {
        "Phishing": ["phishing"],
        "Ransomware": ["ransomware"],
        "Malware": ["malware"],
        "Vulnérabilités": ["vuln"],
        "Fuite de données": ["data_leak"],
        "DDoS": ["ddos"],
        "Cloud": ["cloud", "aws", "azure"],
        "Identité": ["apt", "identity", "credential"]
    }
    
    categories = []
    for name, threat_types in category_mapping.items():
        # Count articles matching this category
        count = await db.news.count_documents({
            "$or": [
                {"threat_type": {"$in": threat_types}},
                {"title": {"$regex": "|".join(threat_types), "$options": "i"}}
            ]
        })
        categories.append(RadarCategory(name=name, value=count))
    
    return RadarResponse(categories=categories)

class GroupedNewsResponse(BaseModel):
    france: List[NewsArticle]
    international: List[NewsArticle]
    france_total: int
    international_total: int

@dashboard_router.get("/news-grouped", response_model=GroupedNewsResponse)
async def get_news_grouped(
    limit: int = Query(10, ge=1, le=50, description="Max items per group")
):
    """Get news grouped by country (France vs International)"""
    
    # Fetch French news (FR country) - sorted by date DESC
    france_cursor = db.news.find({"country": "FR"}).sort([("published_at", -1)]).limit(limit)
    france_articles = await france_cursor.to_list(length=limit)
    france_total = await db.news.count_documents({"country": "FR"})
    
    # Fetch International news (non-FR country) - sorted by date DESC
    international_cursor = db.news.find({"country": {"$ne": "FR"}}).sort([("published_at", -1)]).limit(limit)
    international_articles = await international_cursor.to_list(length=limit)
    international_total = await db.news.count_documents({"country": {"$ne": "FR"}})
    
    return GroupedNewsResponse(
        france=[NewsArticle(**article) for article in france_articles],
        international=[NewsArticle(**article) for article in international_articles],
        france_total=france_total,
        international_total=international_total
    )

@dashboard_router.get("/timeline", response_model=TimelineResponse)
async def get_dashboard_timeline():
    """Get recent threat timeline events"""
    # Get recent articles sorted by date
    cursor = db.news.find({}).sort("published_at", -1).limit(20)
    articles = await cursor.to_list(length=20)
    
    # Map severity values to French
    severity_map = {
        "critique": "Critique",
        "eleve": "Élevé", 
        "moyen": "Moyen",
        "faible": "Faible"
    }
    
    # Map threat types to French
    threat_type_map = {
        "phishing": "Phishing",
        "ransomware": "Ransomware",
        "malware": "Malware",
        "vuln": "Vulnérabilité",
        "data_leak": "Fuite de données",
        "ddos": "DDoS",
        "apt": "APT",
        "scam": "Arnaque",
        "other": "Autre"
    }
    
    events = []
    for article in articles:
        # Get description from tldr or content
        tldr = article.get("tldr", [])
        description = tldr[0] if tldr else article.get("content", "")[:200]
        
        events.append(TimelineEvent(
            id=article.get("id", str(article.get("_id", ""))),
            title=article.get("title", ""),
            source=article.get("source", ""),
            severity=severity_map.get(article.get("severity", "moyen"), "Moyen"),
            threat_type=threat_type_map.get(article.get("threat_type", "other"), "Autre"),
            timestamp=article.get("published_at", datetime.utcnow()),
            description=description,
            link=article.get("url", "")
        ))
    
    return TimelineResponse(events=events)

@dashboard_router.post("/migrate-countries")
async def force_migrate_countries():
    """Force migration of country data for all articles"""
    logger.info("Force country migration requested via API")
    
    # Map sources to their country data
    source_to_country = {s["name"]: {"country": s["country"], "priority": s["priority"], "language": s.get("lang", "en")} for s in RSS_SOURCES}
    
    results = {}
    for source_name, data in source_to_country.items():
        result = await db.news.update_many(
            {"source": source_name},
            {"$set": {"country": data["country"], "priority": data["priority"], "language": data["language"]}}
        )
        if result.modified_count > 0 or result.matched_count > 0:
            results[source_name] = {"matched": result.matched_count, "updated": result.modified_count, "country": data["country"], "priority": data["priority"]}
            if result.modified_count > 0:
                logger.info(f"Force updated {result.modified_count} articles from {source_name}")
    
    return {"message": "Migration complete", "results": results}

app.include_router(dashboard_router)

# ============== LEGACY API ROUTES ==============

legacy_router = APIRouter(prefix="/api")

@legacy_router.get("/news", response_model=NewsResponse)
async def get_news_legacy(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=50),
    severity: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None, alias="type"),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None, description="Filter by country code (FR, US, etc.)"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
):
    return await get_news(page, page_size, severity, threat_type, level, search, country, date_from, date_to)

@legacy_router.get("/news/tension")
async def get_tension_legacy():
    return await get_tension()

@legacy_router.get("/news/{news_id}")
async def get_news_detail_legacy(news_id: str):
    return await get_news_detail(news_id)

@legacy_router.post("/news/ai-summary", response_model=AISummaryResponse)
async def get_ai_summary_legacy(request: AISummaryRequest):
    return await get_ai_summary(request)

@legacy_router.post("/admin/migrate-countries")
async def force_migrate_countries():
    """Force migration of country data for all articles"""
    logger.info("Force country migration requested via API")
    
    # Map sources to their country data
    source_to_country = {s["name"]: {"country": s["country"], "priority": s["priority"], "language": s.get("lang", "en")} for s in RSS_SOURCES}
    
    results = {}
    for source_name, data in source_to_country.items():
        result = await db.news.update_many(
            {"source": source_name},
            {"$set": {"country": data["country"], "priority": data["priority"], "language": data["language"]}}
        )
        if result.modified_count > 0:
            results[source_name] = {"updated": result.modified_count, "country": data["country"], "priority": data["priority"]}
            logger.info(f"Force updated {result.modified_count} articles from {source_name}")
    
    return {"message": "Migration complete", "results": results}

app.include_router(legacy_router)

@app.post("/api/admin/migrate-countries")
async def force_migrate_countries_direct():
    """Force migration of country data for all articles"""
    logger.info("Force country migration requested via API")
    
    # Map sources to their country data
    source_to_country = {s["name"]: {"country": s["country"], "priority": s["priority"], "language": s.get("lang", "en")} for s in RSS_SOURCES}
    
    results = {}
    for source_name, data in source_to_country.items():
        result = await db.news.update_many(
            {"source": source_name},
            {"$set": {"country": data["country"], "priority": data["priority"], "language": data["language"]}}
        )
        if result.modified_count > 0 or result.matched_count > 0:
            results[source_name] = {"matched": result.matched_count, "updated": result.modified_count, "country": data["country"], "priority": data["priority"]}
            if result.modified_count > 0:
                logger.info(f"Force updated {result.modified_count} articles from {source_name}")
    
    return {"message": "Migration complete", "results": results}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
