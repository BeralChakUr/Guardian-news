"""Seed data service for initial database population."""
import uuid
from datetime import datetime, timedelta
from typing import List
from ..database import get_news_collection, get_metrics_collection, get_timeline_collection
import logging

logger = logging.getLogger(__name__)

# Sample news articles
SEED_NEWS = [
    {
        "id": str(uuid.uuid4()),
        "title": "Vulnérabilité critique dans Apache Log4j exploitée activement",
        "source": "CERT-FR",
        "link": "https://www.cert.ssi.gouv.fr/alerte/",
        "published_at": datetime.utcnow() - timedelta(hours=2),
        "raw_summary": "Une vulnérabilité critique (CVE-2024-XXXX) a été découverte dans Apache Log4j permettant l'exécution de code à distance.",
        "ai_summary": "Vulnérabilité critique Log4j permettant l'exécution de code à distance. Mise à jour immédiate requise.",
        "threat_type": "vulnerability",
        "severity": "critical",
        "mitre_tactic": "Initial Access",
        "owasp_category": "A06:2021-Vulnerable Components",
        "tags": ["log4j", "cve", "rce", "java"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Campagne de phishing ciblant les institutions financières françaises",
        "source": "ANSSI",
        "link": "https://www.ssi.gouv.fr/",
        "published_at": datetime.utcnow() - timedelta(hours=5),
        "raw_summary": "Une vaste campagne de phishing utilise des emails frauduleux imitant des banques françaises.",
        "ai_summary": "Campagne de phishing sophistiquée ciblant les clients bancaires. Vérifiez l'authenticité des emails.",
        "threat_type": "phishing",
        "severity": "high",
        "mitre_tactic": "Initial Access",
        "owasp_category": "A07:2021-Identification Failures",
        "tags": ["phishing", "banque", "france"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Nouvelle variante du ransomware LockBit détectée",
        "source": "BleepingComputer",
        "link": "https://www.bleepingcomputer.com/",
        "published_at": datetime.utcnow() - timedelta(hours=8),
        "raw_summary": "LockBit 4.0 intègre de nouvelles techniques d'évasion et cible les infrastructures critiques.",
        "ai_summary": "LockBit 4.0 détecté avec capacités améliorées. Renforcez vos sauvegardes et segmentation réseau.",
        "threat_type": "ransomware",
        "severity": "critical",
        "mitre_tactic": "Impact",
        "owasp_category": "A05:2021-Security Misconfiguration",
        "tags": ["lockbit", "ransomware", "infrastructure"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Fuite de données massive chez un fournisseur cloud européen",
        "source": "Dark Reading",
        "link": "https://www.darkreading.com/",
        "published_at": datetime.utcnow() - timedelta(hours=12),
        "raw_summary": "Plus de 2 millions d'enregistrements clients exposés suite à une mauvaise configuration S3.",
        "ai_summary": "Fuite de données cloud touchant 2M+ d'utilisateurs. Vérifiez vos configurations de stockage.",
        "threat_type": "data_breach",
        "severity": "high",
        "mitre_tactic": "Exfiltration",
        "owasp_category": "A01:2021-Broken Access Control",
        "tags": ["data breach", "cloud", "s3", "misconfiguration"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Microsoft corrige 73 vulnérabilités dans le Patch Tuesday",
        "source": "Microsoft Security",
        "link": "https://msrc.microsoft.com/",
        "published_at": datetime.utcnow() - timedelta(hours=18),
        "raw_summary": "Le Patch Tuesday de mars corrige 73 failles dont 6 critiques affectant Windows et Office.",
        "ai_summary": "Patch Tuesday: 73 corrections dont 6 critiques. Appliquez les mises à jour Windows/Office.",
        "threat_type": "vulnerability",
        "severity": "high",
        "mitre_tactic": "Initial Access",
        "owasp_category": "A06:2021-Vulnerable Components",
        "tags": ["microsoft", "patch tuesday", "windows", "office"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Attaque DDoS record de 3.8 Tbps neutralisée",
        "source": "Cloudflare",
        "link": "https://blog.cloudflare.com/",
        "published_at": datetime.utcnow() - timedelta(days=1),
        "raw_summary": "Cloudflare a bloqué la plus grande attaque DDoS jamais enregistrée, ciblant un client européen.",
        "ai_summary": "Attaque DDoS record de 3.8 Tbps mitigée. Assurez-vous d'avoir une protection anti-DDoS.",
        "threat_type": "ddos",
        "severity": "medium",
        "mitre_tactic": "Impact",
        "owasp_category": "A05:2021-Security Misconfiguration",
        "tags": ["ddos", "cloudflare", "record"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Nouveau malware Android dérobe les identifiants bancaires",
        "source": "Malwarebytes Labs",
        "link": "https://blog.malwarebytes.com/",
        "published_at": datetime.utcnow() - timedelta(days=1, hours=6),
        "raw_summary": "Un nouveau cheval de Troie Android se propage via des apps factices sur le Play Store.",
        "ai_summary": "Trojan Android vol des identifiants bancaires. Téléchargez uniquement depuis sources officielles.",
        "threat_type": "malware",
        "severity": "high",
        "mitre_tactic": "Execution",
        "owasp_category": "A08:2021-Software Integrity Failures",
        "tags": ["android", "malware", "banking", "trojan"],
        "created_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "APT chinois cible les entreprises de défense européennes",
        "source": "The Hacker News",
        "link": "https://thehackernews.com/",
        "published_at": datetime.utcnow() - timedelta(days=2),
        "raw_summary": "Le groupe APT41 utilise de nouvelles techniques pour infiltrer le secteur de la défense.",
        "ai_summary": "APT41 cible la défense européenne. Renforcez la surveillance réseau et la sécurité email.",
        "threat_type": "apt",
        "severity": "critical",
        "mitre_tactic": "Collection",
        "owasp_category": "A09:2021-Security Logging Failures",
        "tags": ["apt", "china", "defense", "espionage"],
        "created_at": datetime.utcnow()
    },
]

# Sample dashboard metrics
SEED_METRICS = {
    "_id": "current",
    "threat_level": "Critical",
    "threat_score": 85,
    "active_alerts": len(SEED_NEWS),
    "critical_vulnerabilities": 3,
    "monitored_sources": 10,
    "updated_at": datetime.utcnow()
}

# Sample radar data
SEED_RADAR = {
    "_id": "current",
    "data": [
        {"category": "Phishing", "value": 75},
        {"category": "Ransomware", "value": 85},
        {"category": "Malware", "value": 60},
        {"category": "Vulnérabilités", "value": 90},
        {"category": "Fuite données", "value": 55},
        {"category": "DDoS", "value": 40},
        {"category": "Cloud", "value": 45},
        {"category": "Identité", "value": 50},
    ],
    "updated_at": datetime.utcnow()
}


async def seed_database() -> dict:
    """Seed the database with initial data if empty."""
    news_col = get_news_collection()
    metrics_col = get_metrics_collection()
    
    results = {
        "news_seeded": 0,
        "metrics_seeded": False,
        "radar_seeded": False
    }
    
    # Seed news if empty
    news_count = await news_col.count_documents({})
    if news_count == 0:
        await news_col.insert_many(SEED_NEWS)
        results["news_seeded"] = len(SEED_NEWS)
        logger.info(f"Seeded {len(SEED_NEWS)} news articles")
    
    # Seed metrics if empty
    metrics = await metrics_col.find_one({"_id": "current"})
    if not metrics:
        await metrics_col.insert_one(SEED_METRICS)
        results["metrics_seeded"] = True
        logger.info("Seeded dashboard metrics")
    
    # Seed radar data
    radar = await metrics_col.find_one({"_id": "radar"})
    if not radar:
        radar_doc = SEED_RADAR.copy()
        radar_doc["_id"] = "radar"
        await metrics_col.insert_one(radar_doc)
        results["radar_seeded"] = True
        logger.info("Seeded radar data")
    
    return results
