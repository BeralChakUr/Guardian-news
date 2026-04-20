"""Application configuration and constants for V4"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

# Application version
APP_VERSION = "4.0.0"
APP_NAME = "Guardian News"
API_VERSION = "v1"

# Database
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "guardian_news")

# LLM
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Anti-bias and deduplication
MAX_SOURCE_PERCENTAGE = 0.30
TITLE_SIMILARITY_THRESHOLD = 0.75

# RSS Ingestion
RSS_INGESTION_INTERVAL_MINUTES = 30
MAX_ARTICLES_PER_FEED = 20
ARTICLE_MAX_AGE_DAYS = 7
DEDUP_LOOKBACK_DAYS = 3

# Paths
BASE_DIR = ROOT_DIR
CONFIG_DIR = BASE_DIR / "config"

# Sectors for article classification
SECTORS = [
    "PME",
    "Santé",
    "Industrie",
    "Finance",
    "Éducation",
    "Administration",
    "Énergie",
    "Transport",
    "Télécom",
    "Commerce",
]

# Attack types
ATTACK_TYPES = [
    "phishing",
    "ransomware",
    "malware",
    "exploit",
    "ddos",
    "data_leak",
    "social_engineering",
    "supply_chain",
    "zero_day",
    "apt",
]

# Severity levels with weights for scoring
SEVERITY_WEIGHTS = {
    "critique": 4,
    "eleve": 3,
    "moyen": 2,
    "faible": 1,
}

# Source reliability scores
SOURCE_RELIABILITY = {
    "CERT-FR": 1.0,
    "ANSSI": 1.0,
    "CISA": 0.95,
    "Cybermalveillance.gouv": 0.95,
    "Sekoia": 0.9,
    "Microsoft Security": 0.9,
    "Cisco Talos": 0.9,
    "The Hacker News": 0.8,
    "BleepingComputer": 0.8,
    "Dark Reading": 0.8,
    "Global Security Mag": 0.75,
    "Le Monde Informatique": 0.75,
    "Malwarebytes Labs": 0.8,
    "SecurityWeek": 0.8,
    "Krebs on Security": 0.85,
}

# Country display names
COUNTRY_NAMES = {
    "FR": "France",
    "US": "États-Unis",
    "GB": "Royaume-Uni",
    "DE": "Allemagne",
    "EU": "Europe",
}
