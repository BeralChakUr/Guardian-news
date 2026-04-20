"""Anti-bias and deduplication utilities"""
from difflib import SequenceMatcher
from typing import List


def apply_source_bias_limit(articles: List, max_percentage: float = 0.30) -> List:
    """Limit articles per source to max_percentage of total (anti-bias)."""
    if not articles:
        return articles
    total = len(articles)
    max_per_source = max(1, int(total * max_percentage))
    source_counts: dict = {}
    result = []
    for article in articles:
        source = getattr(article, "source", None) or (article.get("source", "unknown") if isinstance(article, dict) else "unknown")
        source_counts.setdefault(source, 0)
        if source_counts[source] < max_per_source:
            result.append(article)
            source_counts[source] += 1
    return result


def deduplicate_articles(articles: List, similarity_threshold: float = 0.75) -> List:
    """Remove near-duplicate articles using SequenceMatcher fuzzy title matching."""
    if not articles:
        return articles
    result = []
    seen_titles: List[str] = []
    for article in articles:
        title = getattr(article, "title", None) or (article.get("title", "") if isinstance(article, dict) else "")
        title_lower = title.lower().strip()
        is_duplicate = False
        for seen in seen_titles:
            if SequenceMatcher(None, title_lower, seen).ratio() >= similarity_threshold:
                is_duplicate = True
                break
        if not is_duplicate:
            result.append(article)
            seen_titles.append(title_lower)
    return result
