from fastapi import FastAPI, APIRouter, Query, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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
from bs4 import BeautifulSoup
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-7C9D0F62b1e19D95d8')

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
    {"name": "CERT-FR", "url": "https://www.cert.ssi.gouv.fr/feed/", "score": 10, "lang": "fr"},
    {"name": "CISA", "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml", "score": 10, "lang": "en"},
    {"name": "The Hacker News", "url": "https://feeds.feedburner.com/TheHackersNews", "score": 7, "lang": "en"},
    {"name": "BleepingComputer", "url": "https://www.bleepingcomputer.com/feed/", "score": 8, "lang": "en"},
    {"name": "Dark Reading", "url": "https://www.darkreading.com/rss.xml", "score": 7, "lang": "en"},
    {"name": "SecurityWeek", "url": "https://feeds.feedburner.com/securityweek", "score": 7, "lang": "en"},
    {"name": "Krebs on Security", "url": "https://krebsonsecurity.com/feed/", "score": 8, "lang": "en"},
    {"name": "Cisco Talos", "url": "https://blog.talosintelligence.com/feeds/posts/default", "score": 9, "lang": "en"},
    {"name": "Malwarebytes Labs", "url": "https://blog.malwarebytes.com/feed/", "score": 8, "lang": "en"},
    {"name": "Microsoft Security", "url": "https://www.microsoft.com/en-us/security/blog/feed/", "score": 9, "lang": "en"},
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
            feed = feedparser.parse(response.text)
            
            articles = []
            for entry in feed.entries[:20]:  # Limit per source
                title = entry.get("title", "")
                link = entry.get("link", "")
                content = entry.get("summary", "") or entry.get("description", "")
                
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
                    "source_score": source["score"]
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
            url_hash=self.url_hash(raw_article["url"])
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
        """Calculate and update cyber tension index"""
        now = datetime.utcnow()
        last_24h = now - timedelta(hours=24)
        last_48h = now - timedelta(hours=48)
        
        # Count by severity in last 24h
        critical_count = await self.db.news.count_documents({
            "published_at": {"$gte": last_24h},
            "severity": "critique"
        })
        
        high_count = await self.db.news.count_documents({
            "published_at": {"$gte": last_24h},
            "severity": "eleve"
        })
        
        # Get recent threat types
        recent = await self.db.news.find(
            {"published_at": {"$gte": last_48h}},
            {"threat_type": 1, "title": 1}
        ).sort("published_at", -1).limit(10).to_list(10)
        
        recent_threats = [a["title"][:50] for a in recent[:5]]
        
        # Calculate score (0-100)
        score = min(100, critical_count * 25 + high_count * 10)
        
        if score >= 70:
            level = "Critique"
            reason = f"{critical_count} alertes critiques détectées"
        elif score >= 40:
            level = "Élevé"
            reason = f"{high_count} menaces importantes en cours"
        elif score >= 20:
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
            "recent_threats": recent_threats,
            "updated_at": now
        }
        
        await self.db.tension.update_one(
            {"_id": "current"},
            {"$set": tension_data},
            upsert=True
        )
        
        logger.info(f"Tension updated: {level} (score: {score})")

# Global instances
client = None
db = None
rss_service = None
scheduler = None

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
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.news.count_documents(filter_query)
    
    # Pagination
    skip = (page - 1) * page_size
    
    # Fetch articles
    cursor = db.news.find(filter_query).sort("published_at", -1).skip(skip).limit(page_size)
    articles = await cursor.to_list(page_size)
    
    # Convert to response
    items = [NewsArticle(**article) for article in articles]
    
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
    """Generate AI summary using Emergent LLM"""
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
        # Return fallback summary
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
legacy_router = APIRouter(prefix="/api")

@legacy_router.get("/news", response_model=NewsResponse)
async def get_news_legacy(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=50),
    severity: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None, alias="type"),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    return await get_news(page, page_size, severity, threat_type, level, search)

@legacy_router.get("/news/tension")
async def get_tension_legacy():
    return await get_tension()

@legacy_router.get("/news/{news_id}")
async def get_news_detail_legacy(news_id: str):
    return await get_news_detail(news_id)

@legacy_router.post("/news/ai-summary", response_model=AISummaryResponse)
async def get_ai_summary_legacy(request: AISummaryRequest):
    return await get_ai_summary(request)

app.include_router(legacy_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
