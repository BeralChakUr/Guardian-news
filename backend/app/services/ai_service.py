"""AI-powered threat summary service (Emergent LLM)"""
import hashlib
import json
import logging
import re
from datetime import datetime
from typing import List, Dict

from ..core.config import EMERGENT_LLM_KEY

logger = logging.getLogger(__name__)


# Optional AI integration
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    LlmChat = None
    UserMessage = None
    EMERGENT_AVAILABLE = False


AI_SYSTEM_PROMPT = """Tu es un analyste en cybersécurité spécialisé dans l'intelligence des menaces.

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


def _fallback_summary(articles: List[Dict]) -> Dict:
    return {
        "global_summary": "Résumé automatique indisponible. Veuillez consulter les articles individuellement.",
        "items": [
            {
                "title_fr": article.get("title", "Article"),
                "summary": " ".join(article.get("tldr", ["Aucun résumé disponible"])) if isinstance(article.get("tldr"), list) else article.get("tldr", "Aucun résumé disponible"),
                "threat_type": article.get("threat_type", "autre"),
                "severity": article.get("severity", "moyenne"),
                "key_info": None,
                "action": "Consultez la source pour plus d'informations",
            }
            for article in articles[:5]
        ],
    }


async def generate_ai_summary(articles: List[Dict], mode: str) -> Dict:
    """Generate AI summary; fall back to deterministic summary on failure."""
    if not EMERGENT_AVAILABLE or not EMERGENT_LLM_KEY:
        logger.info("AI integration not available, using fallback summary")
        return _fallback_summary(articles)

    try:
        articles_text = ""
        for idx, article in enumerate(articles, 1):
            tldr = article.get("tldr", article.get("title", ""))
            if isinstance(tldr, list):
                tldr = " ".join(tldr)
            articles_text += (
                f"\nArticle {idx}:\n"
                f"Titre: {article.get('title', 'N/A')}\n"
                f"Source: {article.get('source', 'N/A')}\n"
                f"Lien: {article.get('url', 'N/A')}\n"
                f"Contenu: {tldr[:500]}\n---\n"
            )

        mode_instruction = {
            "simple": "Génère un résumé très simple de 2 phrases maximum, accessible au grand public.",
            "executive": "Génère un résumé stratégique pour les décideurs, focus sur l'impact business et les risques.",
            "analyst": "Génère un résumé technique détaillé pour les analystes sécurité, avec IOCs et recommandations techniques.",
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

        session_id = f"ai_summary_{hashlib.md5(articles_text.encode()).hexdigest()[:8]}"
        llm = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=AI_SYSTEM_PROMPT)
        response = await llm.send_message(UserMessage(text=user_prompt))

        match = re.search(r"\{[\s\S]*\}", response)
        if match:
            return json.loads(match.group())
        raise ValueError("No valid JSON in response")
    except Exception as e:
        logger.error(f"AI Summary error: {e}")
        return _fallback_summary(articles)
