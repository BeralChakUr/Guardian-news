"""Domain enumerations"""
from enum import Enum


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


class SummaryMode(str, Enum):
    SIMPLE = "simple"
    EXECUTIVE = "executive"
    ANALYST = "analyst"
