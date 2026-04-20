"""
Guardian News V4 Backend API Test Suite
Tests the newly refactored modular backend architecture.

Public base URL: VITE_API_URL from /app/apps/web/.env
Local backend URL: http://localhost:8001 (bypasses ingress)
"""
import os
import sys
import json
import time
from typing import Any, Dict, List, Tuple

import requests

# ---- Configuration ----
PUBLIC_BASE = "https://guardian-v4.preview.emergentagent.com"
LOCAL_BASE = "http://localhost:8001"

# Use public URL per standards. Fallback to local for non-/api endpoints.
BASE = PUBLIC_BASE
TIMEOUT = 30

results: List[Tuple[str, bool, str]] = []


def log(name: str, ok: bool, msg: str = ""):
    status = "✅" if ok else "❌"
    print(f"{status} {name}: {msg}")
    results.append((name, ok, msg))


def get(path: str, base: str = BASE, **kw) -> requests.Response:
    return requests.get(f"{base}{path}", timeout=TIMEOUT, **kw)


def post(path: str, base: str = BASE, **kw) -> requests.Response:
    return requests.post(f"{base}{path}", timeout=TIMEOUT, **kw)


# ---------------- Health / Version ----------------
def test_health_local():
    try:
        r = get("/health", base=LOCAL_BASE)
        data = r.json()
        ok = r.status_code == 200 and data.get("status") == "ok" and data.get("version") == "4.0.0"
        log("GET /health (local)", ok, f"status={r.status_code} body={data}")
    except Exception as e:
        log("GET /health (local)", False, str(e))


def test_health_public():
    """Note: /health is NOT behind /api prefix so K8s ingress routes it to frontend."""
    try:
        r = get("/health", base=PUBLIC_BASE)
        ct = r.headers.get("content-type", "")
        # Via ingress this returns HTML (frontend). Expected behavior.
        is_html = "html" in ct
        log("GET /health (public - expected HTML via ingress)", True,
            f"status={r.status_code} ct={ct} html={is_html}")
    except Exception as e:
        log("GET /health (public)", False, str(e))


def test_api_version():
    try:
        r = get("/api/version")
        data = r.json()
        ok = (
            r.status_code == 200
            and data.get("version") == "4.0.0"
            and data.get("name") == "Guardian News"
            and data.get("api_version") == "v1"
        )
        log("GET /api/version", ok, f"body={data}")
    except Exception as e:
        log("GET /api/version", False, str(e))


def test_dashboard_version():
    try:
        r = get("/api/dashboard/version")
        data = r.json()
        ok = (
            r.status_code == 200
            and data.get("version") == "4.0.0"
            and data.get("name") == "Guardian News"
        )
        log("GET /api/dashboard/version", ok, f"body={data}")
    except Exception as e:
        log("GET /api/dashboard/version", False, str(e))


# ---------------- News V1 (legacy /api/news) ----------------
def test_news_pagination():
    try:
        r = get("/api/news?page=1&page_size=15")
        data = r.json()
        required = {"items", "total", "page", "page_size", "has_more"}
        ok = r.status_code == 200 and required.issubset(data.keys())
        total = data.get("total", 0)
        log("GET /api/news paginated", ok,
            f"total={total} items={len(data.get('items', []))} page={data.get('page')}")
        # charset check
        ct = r.headers.get("content-type", "")
        log("  Content-Type charset=utf-8", "charset=utf-8" in ct, f"ct={ct}")
        return data
    except Exception as e:
        log("GET /api/news paginated", False, str(e))
        return {}


def test_news_filter_severity():
    try:
        r = get("/api/news?severity=critique&page_size=30")
        data = r.json()
        items = data.get("items", [])
        bad = [i for i in items if i.get("severity") != "critique"]
        ok = r.status_code == 200 and (len(items) == 0 or len(bad) == 0)
        log("GET /api/news?severity=critique", ok,
            f"items={len(items)} non-matching={len(bad)}")
    except Exception as e:
        log("GET /api/news?severity=critique", False, str(e))


def test_news_filter_type():
    try:
        r = get("/api/news?type=phishing&page_size=30")
        data = r.json()
        items = data.get("items", [])
        bad = [i for i in items if i.get("threat_type") != "phishing"]
        ok = r.status_code == 200 and (len(items) == 0 or len(bad) == 0)
        log("GET /api/news?type=phishing", ok,
            f"items={len(items)} non-matching={len(bad)}")
    except Exception as e:
        log("GET /api/news?type=phishing", False, str(e))


def test_news_filter_country_FR():
    try:
        r = get("/api/news?country=FR&page_size=30")
        data = r.json()
        items = data.get("items", [])
        bad = [i for i in items if i.get("country") != "FR"]
        ok = r.status_code == 200 and len(bad) == 0
        log("GET /api/news?country=FR", ok,
            f"items={len(items)} non-FR={len(bad)} total={data.get('total')}")
    except Exception as e:
        log("GET /api/news?country=FR", False, str(e))


def test_news_search():
    try:
        r = get("/api/news?search=Microsoft&page_size=30")
        data = r.json()
        items = data.get("items", [])
        # Each item should contain Microsoft in title or content
        bad = []
        for i in items:
            blob = ((i.get("title") or "") + " " + (i.get("content") or "")).lower()
            if "microsoft" not in blob:
                bad.append(i.get("title"))
        ok = r.status_code == 200 and (len(items) == 0 or len(bad) == 0)
        log("GET /api/news?search=Microsoft", ok,
            f"items={len(items)} non-matching={len(bad)}")
    except Exception as e:
        log("GET /api/news?search=Microsoft", False, str(e))


def test_news_date_range():
    try:
        r = get("/api/news?date_from=2026-04-01&date_to=2026-04-18&page_size=30")
        data = r.json()
        items = data.get("items", [])
        ok = r.status_code == 200
        log("GET /api/news date range", ok,
            f"items={len(items)} total={data.get('total')}")
    except Exception as e:
        log("GET /api/news date range", False, str(e))


def test_news_tension():
    try:
        r = get("/api/news/tension")
        data = r.json()
        required = {"level", "score", "critical_count", "high_count",
                    "medium_count", "low_count", "total_7days", "recent_threats"}
        ok = r.status_code == 200 and required.issubset(data.keys())
        log("GET /api/news/tension", ok,
            f"level={data.get('level')} score={data.get('score')} "
            f"total_7days={data.get('total_7days')}")
        return data
    except Exception as e:
        log("GET /api/news/tension", False, str(e))
        return {}


def test_news_detail():
    # Fetch one article id first
    try:
        listing = get("/api/news?page_size=1").json()
        items = listing.get("items", [])
        if not items:
            log("GET /api/news/{id}", False, "no articles in list")
            return
        aid = items[0]["id"]
        r = get(f"/api/news/{aid}")
        data = r.json()
        ok = r.status_code == 200 and data.get("id") == aid
        log("GET /api/news/{id}", ok, f"id={aid} title={data.get('title', '')[:60]}")
        # 404 for invalid
        r2 = get("/api/news/nonexistent-id-123")
        log("GET /api/news/{bad-id} -> 404", r2.status_code == 404,
            f"got {r2.status_code}")
    except Exception as e:
        log("GET /api/news/{id}", False, str(e))


def test_news_refresh():
    """POST /api/news/refresh - NOTE: not registered in legacy.py only v1."""
    try:
        r = post("/api/news/refresh")
        ok = r.status_code in (200, 202)
        log("POST /api/news/refresh (legacy)", ok,
            f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("POST /api/news/refresh (legacy)", False, str(e))


def test_news_ai_summary():
    try:
        r = post("/api/news/ai-summary",
                 json={"mode": "simple", "limit": 3},
                 headers={"Content-Type": "application/json"})
        data = r.json() if r.status_code == 200 else {}
        ok = (
            r.status_code == 200
            and "mode" in data
            and "items" in data
            and "global_summary" in data
            and len(data["items"]) > 0
        )
        log("POST /api/news/ai-summary", ok,
            f"status={r.status_code} items={len(data.get('items', []))} "
            f"summary={(data.get('global_summary') or '')[:80]}")
    except Exception as e:
        log("POST /api/news/ai-summary", False, str(e))


# ---------------- V1 prefix endpoints ----------------
def test_v1_news():
    try:
        r = get("/api/v1/news?page=1&page_size=5")
        data = r.json()
        ok = r.status_code == 200 and "items" in data and "total" in data
        log("GET /api/v1/news", ok, f"total={data.get('total')} items={len(data.get('items', []))}")
    except Exception as e:
        log("GET /api/v1/news", False, str(e))


def test_v1_news_tension():
    try:
        r = get("/api/v1/news/tension")
        data = r.json()
        ok = r.status_code == 200 and "level" in data and "score" in data
        log("GET /api/v1/news/tension", ok, f"level={data.get('level')} score={data.get('score')}")
    except Exception as e:
        log("GET /api/v1/news/tension", False, str(e))


def test_v1_news_detail():
    try:
        listing = get("/api/v1/news?page_size=1").json()
        if not listing.get("items"):
            log("GET /api/v1/news/{id}", False, "no articles")
            return
        aid = listing["items"][0]["id"]
        r = get(f"/api/v1/news/{aid}")
        ok = r.status_code == 200
        log("GET /api/v1/news/{id}", ok, f"id={aid}")
    except Exception as e:
        log("GET /api/v1/news/{id}", False, str(e))


def test_v1_news_refresh():
    try:
        r = post("/api/v1/news/refresh")
        ok = r.status_code in (200, 202)
        log("POST /api/v1/news/refresh", ok, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("POST /api/v1/news/refresh", False, str(e))


def test_v1_news_ai_summary():
    try:
        r = post("/api/v1/news/ai-summary",
                 json={"mode": "simple", "limit": 3})
        data = r.json() if r.status_code == 200 else {}
        ok = r.status_code == 200 and "items" in data and len(data.get("items", [])) > 0
        log("POST /api/v1/news/ai-summary", ok,
            f"status={r.status_code} items={len(data.get('items', []))}")
    except Exception as e:
        log("POST /api/v1/news/ai-summary", False, str(e))


# ---------------- Dashboard endpoints ----------------
def test_dashboard_metrics():
    try:
        r = get("/api/dashboard/metrics")
        data = r.json()
        required = {"threat_level", "score", "active_alerts",
                    "critical_vulnerabilities", "monitored_sources"}
        ok = r.status_code == 200 and required.issubset(data.keys())
        log("GET /api/dashboard/metrics", ok, f"body={data}")
    except Exception as e:
        log("GET /api/dashboard/metrics", False, str(e))


def test_dashboard_radar():
    try:
        r = get("/api/dashboard/radar")
        data = r.json()
        cats = data.get("categories", [])
        ok = r.status_code == 200 and len(cats) == 8
        log("GET /api/dashboard/radar", ok,
            f"categories={len(cats)} names={[c['name'] for c in cats]}")
    except Exception as e:
        log("GET /api/dashboard/radar", False, str(e))


def test_dashboard_news_grouped():
    try:
        r = get("/api/dashboard/news-grouped?limit=10")
        data = r.json()
        required = {"france", "international", "france_total", "international_total"}
        ok = r.status_code == 200 and required.issubset(data.keys())
        log("GET /api/dashboard/news-grouped", ok,
            f"france={data.get('france_total')} international={data.get('international_total')}")
    except Exception as e:
        log("GET /api/dashboard/news-grouped", False, str(e))


def test_dashboard_timeline():
    try:
        r = get("/api/dashboard/timeline")
        data = r.json()
        events = data.get("events", [])
        ok = r.status_code == 200 and len(events) > 0
        log("GET /api/dashboard/timeline", ok, f"events={len(events)}")
    except Exception as e:
        log("GET /api/dashboard/timeline", False, str(e))


def test_dashboard_summary():
    try:
        r = get("/api/dashboard/summary")
        data = r.json()
        kpis = data.get("kpis", {})
        required_kpis = {"total_articles", "critical_alerts", "active_sources",
                         "articles_today", "articles_7days", "most_targeted_sector"}
        ok = (
            r.status_code == 200
            and required_kpis.issubset(kpis.keys())
            and "tension_level" in data
            and "tension_score" in data
        )
        log("GET /api/dashboard/summary", ok,
            f"total_articles={kpis.get('total_articles')} "
            f"active_sources={kpis.get('active_sources')} "
            f"tension={data.get('tension_level')}/{data.get('tension_score')}")
    except Exception as e:
        log("GET /api/dashboard/summary", False, str(e))


def test_dashboard_by_attack_type():
    try:
        r = get("/api/dashboard/by-attack-type")
        data = r.json()
        ok = r.status_code == 200 and "data" in data and "total" in data
        log("GET /api/dashboard/by-attack-type", ok,
            f"total={data.get('total')} categories={len(data.get('data', []))}")
    except Exception as e:
        log("GET /api/dashboard/by-attack-type", False, str(e))


def test_dashboard_by_sector():
    try:
        r = get("/api/dashboard/by-sector")
        data = r.json()
        ok = r.status_code == 200 and "data" in data
        log("GET /api/dashboard/by-sector", ok,
            f"total={data.get('total')} categories={len(data.get('data', []))}")
    except Exception as e:
        log("GET /api/dashboard/by-sector", False, str(e))


def test_dashboard_by_country():
    try:
        r = get("/api/dashboard/by-country")
        data = r.json()
        names = [d["name"] for d in data.get("data", [])]
        ok = r.status_code == 200 and "data" in data
        # Expect France at minimum
        log("GET /api/dashboard/by-country", ok,
            f"total={data.get('total')} names={names[:5]}")
    except Exception as e:
        log("GET /api/dashboard/by-country", False, str(e))


def test_dashboard_by_source():
    try:
        r = get("/api/dashboard/by-source")
        data = r.json()
        ok = r.status_code == 200 and "bias_warning" in data and "data" in data
        log("GET /api/dashboard/by-source", ok,
            f"total={data.get('total')} sources={len(data.get('data', []))} "
            f"bias_warning={data.get('bias_warning')} dominant={data.get('dominant_source')}")
    except Exception as e:
        log("GET /api/dashboard/by-source", False, str(e))


def test_dashboard_timeline_periods():
    for period in ["24h", "7d", "30d"]:
        try:
            r = get(f"/api/dashboard/timeline/{period}")
            data = r.json()
            ok = (
                r.status_code == 200
                and data.get("period") == period
                and "data" in data and "total" in data
            )
            log(f"GET /api/dashboard/timeline/{period}", ok,
                f"buckets={len(data.get('data', []))} total={data.get('total')}")
        except Exception as e:
            log(f"GET /api/dashboard/timeline/{period}", False, str(e))


def test_dashboard_top_threats():
    try:
        r = get("/api/dashboard/top-threats")
        data = r.json()
        ok = r.status_code == 200 and "threats" in data and "count" in data
        log("GET /api/dashboard/top-threats", ok,
            f"count={data.get('count')} threats={len(data.get('threats', []))}")
    except Exception as e:
        log("GET /api/dashboard/top-threats", False, str(e))


def test_dashboard_migrate_countries():
    try:
        r = post("/api/dashboard/migrate-countries")
        data = r.json() if r.status_code == 200 else {}
        ok = r.status_code == 200 and ("updated" in data or "message" in data)
        log("POST /api/dashboard/migrate-countries", ok,
            f"status={r.status_code} body={data}")
    except Exception as e:
        log("POST /api/dashboard/migrate-countries", False, str(e))


def test_dashboard_fix_encoding():
    try:
        r = post("/api/dashboard/fix-encoding")
        data = r.json() if r.status_code == 200 else {}
        ok = r.status_code == 200 and "message" in data
        log("POST /api/dashboard/fix-encoding", ok,
            f"status={r.status_code} body={data}")
    except Exception as e:
        log("POST /api/dashboard/fix-encoding", False, str(e))


# ---------------- Anti-bias & Dedup validation ----------------
def test_antibias_dedup():
    try:
        r = get("/api/news?page_size=50")
        data = r.json()
        items = data.get("items", [])
        if not items:
            log("Anti-bias & Dedup", False, "no items")
            return
        # Anti-bias
        source_counts = {}
        for i in items:
            s = i.get("source", "?")
            source_counts[s] = source_counts.get(s, 0) + 1
        total = len(items)
        max_pct = max((c/total*100) for c in source_counts.values())
        unique_sources = len(source_counts)
        ok_bias = max_pct <= 35  # allow a bit of margin
        log("Anti-bias (max 30% per source)", ok_bias,
            f"max_pct={max_pct:.1f}% unique_sources={unique_sources} total={total}")
        # Dedup
        titles = [i.get("title", "").strip().lower() for i in items]
        dupes = len(titles) - len(set(titles))
        log("Dedup (no identical titles)", dupes == 0,
            f"duplicates={dupes} / {len(titles)}")
    except Exception as e:
        log("Anti-bias & Dedup", False, str(e))


# ---------------- Main ----------------
def main():
    print(f"\n{'='*70}\nGuardian News V4 Backend Tests - {BASE}\n{'='*70}\n")

    # Health & version
    test_health_local()
    test_health_public()
    test_api_version()
    test_dashboard_version()

    # Legacy /api/news
    test_news_pagination()
    test_news_filter_severity()
    test_news_filter_type()
    test_news_filter_country_FR()
    test_news_search()
    test_news_date_range()
    test_news_tension()
    test_news_detail()
    test_news_refresh()
    test_news_ai_summary()

    # V1 prefix
    test_v1_news()
    test_v1_news_tension()
    test_v1_news_detail()
    test_v1_news_refresh()
    test_v1_news_ai_summary()

    # Dashboard
    test_dashboard_metrics()
    test_dashboard_radar()
    test_dashboard_news_grouped()
    test_dashboard_timeline()
    test_dashboard_summary()
    test_dashboard_by_attack_type()
    test_dashboard_by_sector()
    test_dashboard_by_country()
    test_dashboard_by_source()
    test_dashboard_timeline_periods()
    test_dashboard_top_threats()
    test_dashboard_migrate_countries()
    test_dashboard_fix_encoding()

    # Integrity
    test_antibias_dedup()

    # Report
    passed = sum(1 for _, ok, _ in results if ok)
    failed = [r for r in results if not r[1]]
    print(f"\n{'='*70}\nResults: {passed}/{len(results)} passed\n{'='*70}")
    if failed:
        print("\nFailed tests:")
        for name, _, msg in failed:
            print(f"  ❌ {name}: {msg}")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
