"""AI summarization service."""
import logging
import re
import json
from typing import Optional
from ..config import get_settings
from ..models import AISummarizeResponse

logger = logging.getLogger(__name__)

# MITRE ATT&CK tactics mapping
MITRE_TACTICS = {
    "phishing": "Initial Access",
    "ransomware": "Impact",
    "malware": "Execution",
    "vulnerability": "Initial Access",
    "data_breach": "Exfiltration",
    "ddos": "Impact",
    "apt": "Collection",
    "scam": "Initial Access",
}

# OWASP categories mapping
OWASP_CATEGORIES = {
    "phishing": "A07:2021-Identification and Authentication Failures",
    "ransomware": "A05:2021-Security Misconfiguration",
    "malware": "A08:2021-Software and Data Integrity Failures",
    "vulnerability": "A06:2021-Vulnerable and Outdated Components",
    "data_breach": "A01:2021-Broken Access Control",
    "ddos": "A05:2021-Security Misconfiguration",
    "apt": "A09:2021-Security Logging and Monitoring Failures",
    "scam": "A07:2021-Identification and Authentication Failures",
}


def classify_threat_type(text: str) -> str:
    """Classify threat type from text."""
    text_lower = text.lower()
    
    if any(kw in text_lower for kw in ["phishing", "hameçonnage", "credential", "spear"]):
        return "phishing"
    if any(kw in text_lower for kw in ["ransomware", "ransom", "rançon", "lockbit", "blackcat"]):
        return "ransomware"
    if any(kw in text_lower for kw in ["malware", "trojan", "virus", "botnet", "spyware"]):
        return "malware"
    if any(kw in text_lower for kw in ["vulnerability", "vulnérabilité", "cve-", "exploit", "patch"]):
        return "vulnerability"
    if any(kw in text_lower for kw in ["data breach", "leak", "fuite", "exposed", "stolen data"]):
        return "data_breach"
    if any(kw in text_lower for kw in ["ddos", "denial of service"]):
        return "ddos"
    if any(kw in text_lower for kw in ["apt", "nation-state", "state-sponsored"]):
        return "apt"
    if any(kw in text_lower for kw in ["scam", "arnaque", "fraud"]):
        return "scam"
    return "other"


def classify_severity(text: str) -> str:
    """Classify severity from text."""
    text_lower = text.lower()
    
    if any(kw in text_lower for kw in ["critical", "critique", "zero-day", "0-day", 
                                        "actively exploited", "emergency", "cvss 9", "cvss 10"]):
        return "critical"
    if any(kw in text_lower for kw in ["high", "élevé", "ransomware", "data breach", 
                                        "exploit", "vulnerability", "cve-"]):
        return "high"
    if any(kw in text_lower for kw in ["medium", "moyen", "warning", "update"]):
        return "medium"
    return "low"


def generate_mock_summary(text: str, title: Optional[str] = None) -> AISummarizeResponse:
    """Generate a mock AI summary when no API key is available."""
    full_text = f"{title or ''} {text}"
    threat_type = classify_threat_type(full_text)
    severity = classify_severity(full_text)
    
    # Generate basic summary
    sentences = text.split('.')[:3]
    summary = '. '.join(s.strip() for s in sentences if s.strip())
    if len(summary) > 300:
        summary = summary[:300] + "..."
    
    return AISummarizeResponse(
        ai_summary=summary or "Résumé non disponible.",
        threat_type=threat_type,
        severity=severity,
        mitre_tactic=MITRE_TACTICS.get(threat_type, "Unknown"),
        owasp_category=OWASP_CATEGORIES.get(threat_type, "Unknown")
    )


async def summarize_with_openai(text: str, title: Optional[str] = None) -> AISummarizeResponse:
    """Summarize using OpenAI API."""
    settings = get_settings()
    
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set, using mock summary")
        return generate_mock_summary(text, title)
    
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""Analyse cet article de cybersécurité et génère un résumé structuré.

Titre: {title or 'N/A'}
Contenu: {text[:2000]}

Réponds en JSON avec:
{{
    "ai_summary": "Résumé en français (2-3 phrases)",
    "threat_type": "phishing|ransomware|malware|vulnerability|data_breach|ddos|apt|scam|other",
    "severity": "critical|high|medium|low",
    "mitre_tactic": "Tactique MITRE ATT&CK",
    "owasp_category": "Catégorie OWASP"
}}"""
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Tu es un analyste en cybersécurité. Réponds uniquement en JSON valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        result_text = response.choices[0].message.content
        json_match = re.search(r'\{[\s\S]*\}', result_text)
        
        if json_match:
            data = json.loads(json_match.group())
            return AISummarizeResponse(**data)
        else:
            raise ValueError("No valid JSON in response")
            
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return generate_mock_summary(text, title)


async def summarize_with_emergent(text: str, title: Optional[str] = None) -> AISummarizeResponse:
    """Summarize using Emergent LLM Key."""
    settings = get_settings()
    
    if not settings.EMERGENT_LLM_KEY:
        logger.warning("EMERGENT_LLM_KEY not set, trying OpenAI")
        return await summarize_with_openai(text, title)
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        prompt = f"""Analyse cet article de cybersécurité et génère un résumé structuré.

Titre: {title or 'N/A'}
Contenu: {text[:2000]}

Réponds en JSON avec:
{{
    "ai_summary": "Résumé en français (2-3 phrases)",
    "threat_type": "phishing|ransomware|malware|vulnerability|data_breach|ddos|apt|scam|other",
    "severity": "critical|high|medium|low",
    "mitre_tactic": "Tactique MITRE ATT&CK",
    "owasp_category": "Catégorie OWASP"
}}"""
        
        llm = LlmChat(
            api_key=settings.EMERGENT_LLM_KEY,
            session_id="ai_summarize",
            system_message="Tu es un analyste en cybersécurité. Réponds uniquement en JSON valide."
        )
        
        response = await llm.send_message(UserMessage(text=prompt))
        json_match = re.search(r'\{[\s\S]*\}', response)
        
        if json_match:
            data = json.loads(json_match.group())
            return AISummarizeResponse(**data)
        else:
            raise ValueError("No valid JSON in response")
            
    except Exception as e:
        logger.error(f"Emergent LLM error: {e}")
        return generate_mock_summary(text, title)


async def summarize_article(text: str, title: Optional[str] = None) -> AISummarizeResponse:
    """Main summarization function - tries available AI services."""
    settings = get_settings()
    
    # Priority: Emergent > OpenAI > Mock
    if settings.EMERGENT_LLM_KEY:
        return await summarize_with_emergent(text, title)
    elif settings.OPENAI_API_KEY:
        return await summarize_with_openai(text, title)
    else:
        logger.info("No AI API keys configured, using mock summary")
        return generate_mock_summary(text, title)
