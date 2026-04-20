"""RSS sources and French cybersecurity ecosystem data"""

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

SOURCE_COUNTRIES = {s["name"]: s["country"] for s in RSS_SOURCES}
SOURCE_PRIORITIES = {s["name"]: s["priority"] for s in RSS_SOURCES}

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
