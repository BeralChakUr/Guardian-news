#!/usr/bin/env python3
"""
Backend Test Suite for Guardian News V3 Phase 2 Improvements
Testing specific requirements from review request:
1. Source Bias Limitation (max 30%)
2. Article Deduplication 
3. Date Filter
4. Threat Level (V3 formula)
5. UTF-8 Headers
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta
from collections import Counter
from difflib import SequenceMatcher
import sys

# Backend URL from environment
BACKEND_URL = "https://france-cyber-intel.preview.emergentagent.com"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_result(self, test_name: str, passed: bool, message: str):
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.failed += 1
            print(f"❌ {test_name}: {message}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        print(f"{'='*60}")
        return self.passed == total

async def test_source_bias_limitation():
    """Test 1: Source Bias Limitation (max 30%)"""
    results = TestResults()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test with larger page size to get good sample
            response = await client.get(f"{BACKEND_URL}/api/news?page=1&page_size=20")
            
            if response.status_code != 200:
                results.add_result("Source Bias - API Call", False, f"API returned {response.status_code}")
                return results
            
            data = response.json()
            articles = data.get("items", [])
            
            if len(articles) == 0:
                results.add_result("Source Bias - Data Available", False, "No articles returned")
                return results
            
            results.add_result("Source Bias - API Call", True, f"Retrieved {len(articles)} articles")
            
            # Count articles per source
            source_counts = Counter()
            for article in articles:
                source = article.get("source", "unknown")
                source_counts[source] += 1
            
            total_articles = len(articles)
            max_allowed_per_source = int(total_articles * 0.30)  # 30% limit
            
            # Check if any source exceeds 30%
            violations = []
            for source, count in source_counts.items():
                percentage = (count / total_articles) * 100
                if count > max_allowed_per_source:
                    violations.append(f"{source}: {count}/{total_articles} ({percentage:.1f}%)")
            
            if violations:
                results.add_result("Source Bias - 30% Limit", False, f"Sources exceeding 30%: {', '.join(violations)}")
            else:
                results.add_result("Source Bias - 30% Limit", True, f"No source exceeds 30% (max: {max(source_counts.values())}/{total_articles})")
            
            # Verify multiple sources are represented
            unique_sources = len(source_counts)
            if unique_sources >= 2:
                results.add_result("Source Bias - Multiple Sources", True, f"{unique_sources} different sources represented")
            else:
                results.add_result("Source Bias - Multiple Sources", False, f"Only {unique_sources} source(s) found")
            
            # Show source distribution
            print(f"📊 Source Distribution:")
            for source, count in source_counts.most_common():
                percentage = (count / total_articles) * 100
                print(f"   {source}: {count} articles ({percentage:.1f}%)")
                
    except Exception as e:
        results.add_result("Source Bias - Test Execution", False, f"Error: {str(e)}")
    
    return results

async def test_article_deduplication():
    """Test 2: Article Deduplication"""
    results = TestResults()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get larger sample to test deduplication
            response = await client.get(f"{BACKEND_URL}/api/news?page=1&page_size=30")
            
            if response.status_code != 200:
                results.add_result("Deduplication - API Call", False, f"API returned {response.status_code}")
                return results
            
            data = response.json()
            articles = data.get("items", [])
            
            if len(articles) == 0:
                results.add_result("Deduplication - Data Available", False, "No articles returned")
                return results
            
            results.add_result("Deduplication - API Call", True, f"Retrieved {len(articles)} articles")
            
            # Check for duplicate or similar titles
            titles = [article.get("title", "") for article in articles]
            duplicates = []
            
            for i, title1 in enumerate(titles):
                for j, title2 in enumerate(titles[i+1:], i+1):
                    similarity = SequenceMatcher(None, title1.lower(), title2.lower()).ratio()
                    if similarity > 0.75:  # 75% similarity threshold
                        duplicates.append({
                            "title1": title1,
                            "title2": title2,
                            "similarity": similarity
                        })
            
            if duplicates:
                results.add_result("Deduplication - No Duplicates", False, f"Found {len(duplicates)} similar title pairs (>75% similarity)")
                for dup in duplicates[:3]:  # Show first 3 examples
                    print(f"   Similar titles ({dup['similarity']:.2f}): '{dup['title1'][:50]}...' vs '{dup['title2'][:50]}...'")
            else:
                results.add_result("Deduplication - No Duplicates", True, f"No duplicate titles found (checked {len(titles)} titles)")
            
            # Check for exact duplicates
            exact_duplicates = len(titles) - len(set(titles))
            if exact_duplicates > 0:
                results.add_result("Deduplication - No Exact Duplicates", False, f"Found {exact_duplicates} exact duplicate titles")
            else:
                results.add_result("Deduplication - No Exact Duplicates", True, "No exact duplicate titles found")
                
    except Exception as e:
        results.add_result("Deduplication - Test Execution", False, f"Error: {str(e)}")
    
    return results

async def test_date_filter():
    """Test 3: Date Filter"""
    results = TestResults()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test date filtering with specific date range
            date_from = "2026-04-01"
            date_to = "2026-04-02"
            
            response = await client.get(f"{BACKEND_URL}/api/news?page=1&page_size=10&date_from={date_from}&date_to={date_to}")
            
            if response.status_code != 200:
                results.add_result("Date Filter - API Call", False, f"API returned {response.status_code}")
                return results
            
            data = response.json()
            articles = data.get("items", [])
            
            results.add_result("Date Filter - API Call", True, f"API call successful, returned {len(articles)} articles")
            
            # Verify all articles are within the date range
            date_violations = []
            for article in articles:
                published_str = article.get("published_at", "")
                if published_str:
                    try:
                        # Parse the date (handle different formats)
                        if "T" in published_str:
                            published_date = datetime.fromisoformat(published_str.replace("Z", "+00:00")).date()
                        else:
                            published_date = datetime.fromisoformat(published_str).date()
                        
                        filter_start = datetime.fromisoformat(date_from).date()
                        filter_end = datetime.fromisoformat(date_to).date()
                        
                        if not (filter_start <= published_date <= filter_end):
                            date_violations.append(f"Article '{article.get('title', '')[:50]}...' dated {published_date}")
                    except Exception as e:
                        date_violations.append(f"Invalid date format: {published_str}")
            
            if date_violations:
                results.add_result("Date Filter - Date Range Compliance", False, f"Found {len(date_violations)} articles outside date range")
                for violation in date_violations[:3]:  # Show first 3
                    print(f"   {violation}")
            else:
                results.add_result("Date Filter - Date Range Compliance", True, f"All {len(articles)} articles within specified date range ({date_from} to {date_to})")
                
    except Exception as e:
        results.add_result("Date Filter - Test Execution", False, f"Error: {str(e)}")
    
    return results

async def test_threat_level_v3():
    """Test 4: Threat Level (V3 formula)"""
    results = TestResults()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{BACKEND_URL}/api/news/tension")
            
            if response.status_code != 200:
                results.add_result("Threat Level - API Call", False, f"API returned {response.status_code}")
                return results
            
            data = response.json()
            
            results.add_result("Threat Level - API Call", True, "Tension endpoint accessible")
            
            # Check required fields for V3 formula
            required_fields = ["score", "level", "total_7days", "critical_count", "high_count", "medium_count", "low_count"]
            missing_fields = []
            
            for field in required_fields:
                if field not in data:
                    missing_fields.append(field)
            
            if missing_fields:
                results.add_result("Threat Level - Required Fields", False, f"Missing fields: {', '.join(missing_fields)}")
            else:
                results.add_result("Threat Level - Required Fields", True, "All required V3 fields present")
            
            # Verify data types and ranges
            score = data.get("score", 0)
            level = data.get("level", "")
            
            if isinstance(score, (int, float)) and 0 <= score <= 100:
                results.add_result("Threat Level - Score Range", True, f"Score {score} is valid (0-100)")
            else:
                results.add_result("Threat Level - Score Range", False, f"Invalid score: {score}")
            
            if level in ["Faible", "Modéré", "Élevé", "Critique"]:
                results.add_result("Threat Level - Level Values", True, f"Level '{level}' is valid")
            else:
                results.add_result("Threat Level - Level Values", False, f"Invalid level: {level}")
            
            # Show current tension data
            print(f"📊 Current Tension Data:")
            print(f"   Level: {data.get('level', 'N/A')}")
            print(f"   Score: {data.get('score', 'N/A')}")
            print(f"   Critical: {data.get('critical_count', 'N/A')}")
            print(f"   High: {data.get('high_count', 'N/A')}")
            print(f"   Medium: {data.get('medium_count', 'N/A')}")
            print(f"   Low: {data.get('low_count', 'N/A')}")
            print(f"   Total 7 days: {data.get('total_7days', 'N/A')}")
                
    except Exception as e:
        results.add_result("Threat Level - Test Execution", False, f"Error: {str(e)}")
    
    return results

async def test_utf8_headers():
    """Test 5: UTF-8 Headers"""
    results = TestResults()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{BACKEND_URL}/api/news?page=1&page_size=5")
            
            if response.status_code != 200:
                results.add_result("UTF-8 Headers - API Call", False, f"API returned {response.status_code}")
                return results
            
            results.add_result("UTF-8 Headers - API Call", True, "API call successful")
            
            # Check Content-Type header
            content_type = response.headers.get("content-type", "")
            
            if "charset=utf-8" in content_type.lower():
                results.add_result("UTF-8 Headers - Charset", True, f"Content-Type includes charset=utf-8: {content_type}")
            else:
                results.add_result("UTF-8 Headers - Charset", False, f"Content-Type missing charset=utf-8: {content_type}")
            
            # Test UTF-8 content handling
            try:
                data = response.json()
                articles = data.get("items", [])
                
                # Check for proper UTF-8 encoding in article content
                utf8_issues = []
                for article in articles[:3]:  # Check first 3 articles
                    title = article.get("title", "")
                    content = article.get("content", "")
                    
                    # Look for common encoding issues
                    for text in [title, content]:
                        if any(char in text for char in ["Ã", "â€", "Â"]):  # Common mojibake patterns
                            utf8_issues.append(f"Potential encoding issue in: {text[:50]}...")
                
                if utf8_issues:
                    results.add_result("UTF-8 Headers - Content Encoding", False, f"Found {len(utf8_issues)} potential encoding issues")
                    for issue in utf8_issues[:2]:  # Show first 2
                        print(f"   {issue}")
                else:
                    results.add_result("UTF-8 Headers - Content Encoding", True, "No obvious UTF-8 encoding issues detected")
                    
            except json.JSONDecodeError:
                results.add_result("UTF-8 Headers - JSON Parsing", False, "Failed to parse JSON response")
                
    except Exception as e:
        results.add_result("UTF-8 Headers - Test Execution", False, f"Error: {str(e)}")
    
    return results

async def main():
    """Run all V3 Phase 2 improvement tests"""
    print("🚀 Starting Guardian News V3 Phase 2 Backend Tests")
    print(f"🔗 Testing Backend URL: {BACKEND_URL}")
    print("="*60)
    
    all_results = TestResults()
    
    # Run all tests
    tests = [
        ("Source Bias Limitation (max 30%)", test_source_bias_limitation),
        ("Article Deduplication", test_article_deduplication),
        ("Date Filter", test_date_filter),
        ("Threat Level (V3 formula)", test_threat_level_v3),
        ("UTF-8 Headers", test_utf8_headers)
    ]
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} Tests...")
        print("-" * 40)
        
        test_results = await test_func()
        
        # Aggregate results
        for result in test_results.results:
            all_results.add_result(result["test"], result["passed"], result["message"])
    
    # Final summary
    success = all_results.summary()
    
    if success:
        print("🎉 All V3 Phase 2 tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - see details above")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)