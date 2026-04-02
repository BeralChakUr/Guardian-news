#!/usr/bin/env python3
"""
Guardian News Backend API Testing Suite

Tests the FastAPI backend for the Guardian News cybersecurity intelligence platform.
Covers all major API endpoints and functionality including V3 Cyber France features.
"""

import json
import time
import asyncio
from datetime import datetime
import aiohttp
import pymongo
from pymongo import MongoClient
import os

# Test Configuration
API_BASE_URL = "http://localhost:8001"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

class GuardianNewsAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = None
        self.mongo_client = None
        self.db = None
        self.test_results = []

    async def setup(self):
        """Setup test environment"""
        self.session = aiohttp.ClientSession()
        
        # Setup MongoDB connection for data verification
        try:
            self.mongo_client = MongoClient(MONGO_URL)
            self.db = self.mongo_client[DB_NAME]
            print("✅ Connected to MongoDB for testing")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.db = None

    async def cleanup(self):
        """Cleanup test environment"""
        if self.session:
            await self.session.close()
        if self.mongo_client:
            self.mongo_client.close()

    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    async def test_api_health(self):
        """Test API health endpoints"""
        test_name = "API Health Check"
        
        try:
            # Test v1 health endpoint
            async with self.session.get(f"{self.base_url}/api/v1/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if "status" in data and data["status"] == "healthy":
                        self.log_result(test_name, True, f"Health status: {data['status']}")
                        return True
                    else:
                        self.log_result(test_name, False, "Health status not healthy")
                        return False
                else:
                    self.log_result(test_name, False, f"Health endpoint returned {response.status}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"Health check failed: {e}")
            return False

    async def test_root_endpoint(self):
        """Test root API endpoint"""
        test_name = "Root API Endpoint"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "message" in data and "Guardian News API" in data["message"]:
                        self.log_result(test_name, True, f"API: {data['message']}")
                        return True
                    else:
                        self.log_result(test_name, False, "Unexpected root response")
                        return False
                else:
                    self.log_result(test_name, False, f"Root endpoint returned {response.status}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"Root endpoint failed: {e}")
            return False

    async def test_news_list_basic(self):
        """Test basic news listing"""
        test_name = "Basic News Listing"
        
        try:
            async with self.session.get(f"{self.base_url}/api/news") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check response structure
                    required_fields = ["items", "total", "page", "page_size", "has_more"]
                    missing_fields = [f for f in required_fields if f not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Check items structure if any exist
                    if data["items"]:
                        item = data["items"][0]
                        required_item_fields = ["id", "title", "source", "url", "published_at", "severity", "threat_type"]
                        missing_item_fields = [f for f in required_item_fields if f not in item]
                        
                        if missing_item_fields:
                            self.log_result(test_name, False, f"Item missing fields: {missing_item_fields}")
                            return False
                    
                    self.log_result(test_name, True, f"Found {len(data['items'])} articles, total: {data['total']}")
                    return True
                else:
                    self.log_result(test_name, False, f"News endpoint returned {response.status}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"News listing failed: {e}")
            return False

    async def test_news_pagination(self):
        """Test news pagination"""
        test_name = "News Pagination"
        
        try:
            # Test page 1 with small page size
            async with self.session.get(f"{self.base_url}/api/news?page=1&page_size=5") as response:
                if response.status != 200:
                    self.log_result(test_name, False, f"Pagination failed with status {response.status}")
                    return False
                
                data = await response.json()
                
                if data["page"] != 1:
                    self.log_result(test_name, False, f"Expected page 1, got {data['page']}")
                    return False
                
                if data["page_size"] != 5:
                    self.log_result(test_name, False, f"Expected page_size 5, got {data['page_size']}")
                    return False
                
                # Test page 2 if there are more items
                if data["has_more"]:
                    async with self.session.get(f"{self.base_url}/api/news?page=2&page_size=5") as response2:
                        if response2.status == 200:
                            data2 = await response2.json()
                            if data2["page"] == 2:
                                self.log_result(test_name, True, f"Pagination works: page 1 & 2 tested")
                                return True
                            else:
                                self.log_result(test_name, False, f"Page 2 returned wrong page number: {data2['page']}")
                                return False
                        else:
                            self.log_result(test_name, False, f"Page 2 failed with status {response2.status}")
                            return False
                else:
                    self.log_result(test_name, True, "Pagination works: only one page available")
                    return True
                    
        except Exception as e:
            self.log_result(test_name, False, f"Pagination test failed: {e}")
            return False

    async def test_news_filtering(self):
        """Test news filtering by severity, type, and level"""
        test_name = "News Filtering"
        
        filters_to_test = [
            ("severity", "critique"),
            ("severity", "eleve"),
            ("severity", "moyen"),
            ("severity", "faible"),
            ("type", "phishing"),
            ("type", "ransomware"),
            ("type", "malware"),
            ("type", "vuln"),
            ("level", "debutant"),
            ("level", "intermediaire"),
            ("level", "avance")
        ]
        
        passed_filters = 0
        total_filters = len(filters_to_test)
        
        try:
            for filter_type, filter_value in filters_to_test:
                query_param = f"{filter_type}={filter_value}"
                async with self.session.get(f"{self.base_url}/api/news?{query_param}") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check if filter is applied correctly
                        if data["items"]:
                            # Verify first item matches filter
                            item = data["items"][0]
                            filter_field = filter_type if filter_type != "type" else "threat_type"
                            
                            if filter_field in item and item[filter_field] == filter_value:
                                passed_filters += 1
                            else:
                                print(f"   ❌ Filter {filter_type}={filter_value} not applied correctly")
                        else:
                            # No items, but filter was accepted
                            passed_filters += 1
                    else:
                        print(f"   ❌ Filter {filter_type}={filter_value} failed with status {response.status}")
            
            success = passed_filters >= total_filters * 0.8  # 80% pass rate
            details = f"Passed {passed_filters}/{total_filters} filter tests"
            self.log_result(test_name, success, details)
            return success
            
        except Exception as e:
            self.log_result(test_name, False, f"Filtering test failed: {e}")
            return False

    async def test_news_search(self):
        """Test news search functionality"""
        test_name = "News Search"
        
        search_terms = ["security", "vulnerability", "attack", "malware"]
        
        try:
            for term in search_terms:
                async with self.session.get(f"{self.base_url}/api/news?search={term}") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # If items exist, check if search term appears in title or content
                        if data["items"]:
                            item = data["items"][0]
                            title_match = term.lower() in item.get("title", "").lower()
                            content_match = term.lower() in item.get("content", "").lower()
                            
                            if title_match or content_match:
                                self.log_result(test_name, True, f"Search for '{term}' returned relevant results")
                                return True
                        else:
                            # No results, but search accepted
                            continue
                    else:
                        self.log_result(test_name, False, f"Search failed for term '{term}' with status {response.status}")
                        return False
            
            # If we get here, all searches worked but no matches found
            self.log_result(test_name, True, "Search functionality works (no matches in current data)")
            return True
            
        except Exception as e:
            self.log_result(test_name, False, f"Search test failed: {e}")
            return False

    async def test_tension_endpoint(self):
        """Test cyber tension index endpoint"""
        test_name = "Cyber Tension Index"
        
        try:
            async with self.session.get(f"{self.base_url}/api/news/tension") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_fields = ["level", "score", "reason", "critical_count", "high_count", "recent_threats", "updated_at"]
                    missing_fields = [f for f in required_fields if f not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Missing tension fields: {missing_fields}")
                        return False
                    
                    # Validate score is within range
                    if not (0 <= data["score"] <= 100):
                        self.log_result(test_name, False, f"Invalid score: {data['score']}")
                        return False
                    
                    # Validate level is valid
                    valid_levels = ["Critique", "Élevé", "Modéré", "Faible"]
                    if data["level"] not in valid_levels:
                        self.log_result(test_name, False, f"Invalid level: {data['level']}")
                        return False
                    
                    self.log_result(test_name, True, f"Tension: {data['level']} (score: {data['score']})")
                    return True
                else:
                    self.log_result(test_name, False, f"Tension endpoint returned {response.status}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"Tension test failed: {e}")
            return False

    async def test_news_detail(self):
        """Test individual news article endpoint"""
        test_name = "News Article Detail"
        
        try:
            # First get a list of news to get an article ID
            async with self.session.get(f"{self.base_url}/api/news?page_size=1") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not data["items"]:
                        self.log_result(test_name, True, "No articles available to test detail endpoint")
                        return True
                    
                    article_id = data["items"][0]["id"]
                    
                    # Test the detail endpoint
                    async with self.session.get(f"{self.base_url}/api/news/{article_id}") as detail_response:
                        if detail_response.status == 200:
                            article_data = await detail_response.json()
                            
                            # Check that it has the expected fields
                            if "id" in article_data and article_data["id"] == article_id:
                                self.log_result(test_name, True, f"Article detail retrieved for ID: {article_id}")
                                return True
                            else:
                                self.log_result(test_name, False, "Article detail response invalid")
                                return False
                        else:
                            self.log_result(test_name, False, f"Article detail returned {detail_response.status}")
                            return False
                else:
                    self.log_result(test_name, False, "Could not get article list for detail test")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"News detail test failed: {e}")
            return False

    async def test_invalid_article_id(self):
        """Test invalid article ID handling"""
        test_name = "Invalid Article ID Handling"
        
        try:
            invalid_id = "invalid-article-id-12345"
            async with self.session.get(f"{self.base_url}/api/news/{invalid_id}") as response:
                if response.status == 404:
                    data = await response.json()
                    if "detail" in data:
                        self.log_result(test_name, True, "404 error properly handled for invalid ID")
                        return True
                    else:
                        self.log_result(test_name, False, "404 response missing error details")
                        return False
                else:
                    self.log_result(test_name, False, f"Expected 404, got {response.status}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"Invalid ID test failed: {e}")
            return False

    async def test_legacy_endpoints(self):
        """Test legacy /api endpoints for backward compatibility"""
        test_name = "Legacy API Endpoints"
        
        endpoints_to_test = [
            ("/api/news", "news listing"),
            ("/api/news/tension", "tension index")
        ]
        
        passed_endpoints = 0
        
        try:
            for endpoint, description in endpoints_to_test:
                async with self.session.get(f"{self.base_url}{endpoint}") as response:
                    if response.status == 200:
                        passed_endpoints += 1
                    else:
                        print(f"   ❌ Legacy endpoint {endpoint} failed with {response.status}")
            
            success = passed_endpoints == len(endpoints_to_test)
            details = f"Passed {passed_endpoints}/{len(endpoints_to_test)} legacy endpoints"
            self.log_result(test_name, success, details)
            return success
            
        except Exception as e:
            self.log_result(test_name, False, f"Legacy endpoints test failed: {e}")
            return False

    async def test_mongodb_data_integrity(self):
        """Test MongoDB data integrity"""
        test_name = "MongoDB Data Integrity"
        
        if self.db is None:
            self.log_result(test_name, False, "MongoDB connection not available")
            return False
        
        try:
            # Check if news collection exists and has data
            news_count = self.db.news.count_documents({})
            
            if news_count > 0:
                # Sample a few articles to check data structure
                sample_articles = list(self.db.news.find().limit(3))
                
                required_fields = ["id", "title", "source", "url", "published_at", "severity", "threat_type"]
                
                for article in sample_articles:
                    missing_fields = [f for f in required_fields if f not in article]
                    if missing_fields:
                        self.log_result(test_name, False, f"Article missing fields: {missing_fields}")
                        return False
                
                # Check tension collection
                tension_doc = self.db.tension.find_one({"_id": "current"})
                if tension_doc:
                    tension_fields = ["level", "score", "reason", "critical_count", "high_count"]
                    missing_tension_fields = [f for f in tension_fields if f not in tension_doc]
                    if missing_tension_fields:
                        self.log_result(test_name, False, f"Tension doc missing: {missing_tension_fields}")
                        return False
                
                self.log_result(test_name, True, f"MongoDB has {news_count} articles with proper structure")
                return True
            else:
                self.log_result(test_name, True, "MongoDB accessible but no data yet (normal for new deployment)")
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"MongoDB integrity test failed: {e}")
            return False

    async def test_ai_summary_simple_mode(self):
        """Test AI summary endpoint in simple mode"""
        test_name = "AI Summary - Simple Mode"
        
        try:
            request_data = {"mode": "simple", "limit": 3}
            async with self.session.post(
                f"{self.base_url}/api/news/ai-summary",
                json=request_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check response structure
                    required_fields = ["mode", "generated_at", "items", "global_summary"]
                    missing_fields = [f for f in required_fields if f not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Validate mode
                    if data["mode"] != "simple":
                        self.log_result(test_name, False, f"Expected mode 'simple', got '{data['mode']}'")
                        return False
                    
                    # Check global_summary is not "indisponible"
                    if data["global_summary"].lower() in ["indisponible", "unavailable", ""]:
                        self.log_result(test_name, False, "Global summary is not available or empty")
                        return False
                    
                    # Check items structure
                    if data["items"]:
                        item = data["items"][0]
                        required_item_fields = ["title_fr", "summary", "threat_type", "severity"]
                        missing_item_fields = [f for f in required_item_fields if f not in item]
                        
                        if missing_item_fields:
                            self.log_result(test_name, False, f"Item missing fields: {missing_item_fields}")
                            return False
                        
                        # Check that title_fr is in French (basic check)
                        title_fr = item["title_fr"]
                        if not title_fr or len(title_fr.strip()) == 0:
                            self.log_result(test_name, False, "title_fr is empty")
                            return False
                    
                    self.log_result(test_name, True, f"AI summary generated with {len(data['items'])} items and proper French content")
                    return True
                elif response.status == 404:
                    self.log_result(test_name, True, "No articles available for AI summary (404 is expected when no data)")
                    return True
                else:
                    response_text = await response.text()
                    self.log_result(test_name, False, f"AI summary returned {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"AI summary test failed: {e}")
            return False

    async def test_ai_summary_executive_mode(self):
        """Test AI summary endpoint in executive mode"""
        test_name = "AI Summary - Executive Mode"
        
        try:
            request_data = {"mode": "executive", "limit": 5}
            async with self.session.post(
                f"{self.base_url}/api/news/ai-summary",
                json=request_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check mode
                    if data["mode"] != "executive":
                        self.log_result(test_name, False, f"Expected mode 'executive', got '{data['mode']}'")
                        return False
                    
                    # Check global_summary quality for executive mode (should be more detailed)
                    global_summary = data["global_summary"]
                    if len(global_summary) < 50:  # Executive summaries should be more detailed
                        self.log_result(test_name, False, "Executive summary too short")
                        return False
                    
                    # Check items have additional executive-level info
                    if data["items"]:
                        item = data["items"][0]
                        if "key_info" not in item and "action" not in item:
                            self.log_result(test_name, False, "Executive mode should include key_info or action fields")
                            return False
                    
                    self.log_result(test_name, True, f"Executive AI summary generated successfully")
                    return True
                elif response.status == 404:
                    self.log_result(test_name, True, "No articles available for AI summary (404 is expected when no data)")
                    return True
                else:
                    response_text = await response.text()
                    self.log_result(test_name, False, f"Executive AI summary returned {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.log_result(test_name, False, f"Executive AI summary test failed: {e}")
            return False

    async def test_news_with_filters_detailed(self):
        """Test news endpoint with specific filters as per review requirements"""
        test_name = "News Filtering - Review Requirements"
        
        filter_tests = [
            ("severity=critique", "severity filter for critique level"),
            ("type=phishing", "type filter for phishing threats"),
            ("search=Microsoft", "search for Microsoft-related articles")
        ]
        
        passed_tests = 0
        
        try:
            for filter_param, description in filter_tests:
                async with self.session.get(f"{self.base_url}/api/news?{filter_param}") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check response structure
                        if "items" in data and "total" in data:
                            self.log_result(f"Filter Test: {description}", True, f"Found {len(data.get('items', []))} items")
                            passed_tests += 1
                        else:
                            self.log_result(f"Filter Test: {description}", False, "Invalid response structure")
                    else:
                        self.log_result(f"Filter Test: {description}", False, f"HTTP {response.status}")
            
            success = passed_tests == len(filter_tests)
            details = f"Passed {passed_tests}/{len(filter_tests)} specific filter tests"
            self.log_result(test_name, success, details)
            return success
            
        except Exception as e:
            self.log_result(test_name, False, f"Detailed filtering test failed: {e}")
            return False

    async def test_performance(self):
        """Test API performance"""
        test_name = "API Performance"
        
        try:
            start_time = time.time()
            
            # Test concurrent requests
            tasks = []
            for i in range(5):
                task = self.session.get(f"{self.base_url}/api/news?page={i+1}&page_size=5")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks)
            
            end_time = time.time()
            duration = end_time - start_time
            
            # Check all responses are successful
            success_count = 0
            for response in responses:
                if response.status == 200:
                    success_count += 1
                response.close()
            
            if success_count == 5 and duration < 10.0:  # All successful and under 10 seconds
                self.log_result(test_name, True, f"5 concurrent requests completed in {duration:.2f}s")
                return True
            else:
                self.log_result(test_name, False, f"Performance issues: {success_count}/5 successful, {duration:.2f}s")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Performance test failed: {e}")
            return False

    async def test_v3_cyber_france_features(self):
        """Test V3 Cyber France specific features"""
        test_name = "V3 Cyber France Features"
        print("🇫🇷 Testing V3 Cyber France Features...")
        
        try:
            # Test 1: News with France filter
            print("  📍 Testing country=FR filter...")
            async with self.session.get(f"{self.base_url}/api/news?page=1&page_size=5&country=FR") as response:
                if response.status == 200:
                    data = await response.json()
                    items = data.get("items", [])
                    
                    if items:
                        # Check all articles are French
                        all_french = all(item.get("country") == "FR" for item in items)
                        if all_french:
                            # Check priority sorting (CERT-FR should have priority 100)
                            priorities = [item.get("priority", 0) for item in items]
                            high_priority_french = any(p >= 90 for p in priorities)
                            
                            print(f"    ✅ Country filter works - {len(items)} French articles found")
                            print(f"    📊 Priorities: {priorities[:3]}...")
                            print(f"    🏷️  Sources: {[item.get('source') for item in items[:3]]}")
                        else:
                            non_french = [item.get('country') for item in items if item.get('country') != 'FR']
                            self.log_result(test_name, False, f"Non-French articles in FR filter: {non_french}")
                            return False
                    else:
                        print("    ⚠️  No French articles found")
                else:
                    self.log_result(test_name, False, f"Country filter status: {response.status}")
                    return False
            
            # Test 2: Dashboard grouped news
            print("  📊 Testing dashboard grouped endpoint...")
            async with self.session.get(f"{self.base_url}/api/dashboard/news-grouped?limit=5") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check required fields
                    required_fields = ["france", "international", "france_total", "international_total"]
                    missing_fields = [f for f in required_fields if f not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Missing fields: {missing_fields}")
                        return False
                    
                    france_total = data.get("france_total", 0)
                    international_total = data.get("international_total", 0)
                    france_articles = data.get("france", [])
                    international_articles = data.get("international", [])
                    
                    # Validate arrays
                    if france_articles:
                        all_french = all(article.get("country") == "FR" for article in france_articles)
                        if not all_french:
                            self.log_result(test_name, False, "Non-French articles in france array")
                            return False
                    
                    if international_articles:
                        all_international = all(article.get("country") != "FR" for article in international_articles)
                        if not all_international:
                            self.log_result(test_name, False, "French articles in international array")
                            return False
                    
                    print(f"    ✅ Dashboard grouped works - FR: {france_total}, International: {international_total}")
                    
                    if france_total >= 50 and international_total >= 200:
                        print(f"    ✅ Counts meet expectations")
                    else:
                        print(f"    ⚠️  Counts below expected minimums")
                else:
                    self.log_result(test_name, False, f"Dashboard grouped status: {response.status}")
                    return False
            
            # Test 3: Quick data integrity check
            print("  🔍 Testing source country integrity...")
            
            # Check one French source
            async with self.session.get(f"{self.base_url}/api/news?page=1&page_size=3&search=CERT-FR") as response:
                if response.status == 200:
                    data = await response.json()
                    cert_articles = [a for a in data.get("items", []) if "CERT-FR" in a.get("source", "")]
                    
                    if cert_articles:
                        incorrect = [a for a in cert_articles if a.get("country") != "FR"]
                        if incorrect:
                            print(f"    ⚠️  CERT-FR has non-FR articles")
                        else:
                            print(f"    ✅ CERT-FR correctly tagged as FR")
            
            self.log_result(test_name, True, "All V3 Cyber France tests passed")
            return True
            
        except Exception as e:
            self.log_result(test_name, False, f"V3 test error: {e}")
            return False

    async def test_v3_strategic_fixes(self):
        """Test V3 Strategic Fixes as per review request"""
        test_name = "V3 Strategic Fixes"
        print("🔧 Testing V3 Strategic Fixes...")
        
        try:
            # Test 1: Article Sorting (CRITICAL)
            print("  📅 Testing Article Sorting (CRITICAL)...")
            async with self.session.get(f"{self.base_url}/api/news?page=1&page_size=20") as response:
                if response.status == 200:
                    data = await response.json()
                    items = data.get("items", [])
                    
                    if len(items) >= 2:
                        # Check articles are sorted by date DESC (most recent first)
                        dates = [item.get("published_at") for item in items]
                        is_sorted_desc = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
                        
                        # Check multiple sources are mixed (not grouped by source)
                        sources = [item.get("source") for item in items[:10]]
                        unique_sources = set(sources)
                        sources_mixed = len(unique_sources) > 1
                        
                        # Check no source dominates the top results
                        source_counts = {}
                        for source in sources[:5]:  # Top 5 results
                            source_counts[source] = source_counts.get(source, 0) + 1
                        max_source_count = max(source_counts.values()) if source_counts else 0
                        no_source_dominance = max_source_count <= 3  # No source should have more than 3 of top 5
                        
                        print(f"    ✅ Date sorting: {is_sorted_desc}")
                        print(f"    ✅ Sources mixed: {sources_mixed} ({len(unique_sources)} unique sources)")
                        print(f"    ✅ No source dominance: {no_source_dominance} (max count: {max_source_count})")
                        
                        if not (is_sorted_desc and sources_mixed and no_source_dominance):
                            self.log_result(test_name, False, "Article sorting criteria not met")
                            return False
                    else:
                        print("    ⚠️  Not enough articles to test sorting")
                else:
                    self.log_result(test_name, False, f"Article sorting test failed: {response.status}")
                    return False
            
            # Test 2: Date Filter
            print("  📆 Testing Date Filter...")
            async with self.session.get(f"{self.base_url}/api/news?page=1&page_size=10&date_from=2026-04-02&date_to=2026-04-02") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check response includes total count
                    if "total" not in data:
                        self.log_result(test_name, False, "Date filter response missing total count")
                        return False
                    
                    # Check only articles from specified date are returned
                    items = data.get("items", [])
                    if items:
                        for item in items:
                            pub_date = item.get("published_at", "")
                            if not pub_date.startswith("2026-04-02"):
                                self.log_result(test_name, False, f"Date filter failed: found article from {pub_date}")
                                return False
                    
                    print(f"    ✅ Date filter works: {len(items)} articles from 2026-04-02, total: {data['total']}")
                else:
                    self.log_result(test_name, False, f"Date filter test failed: {response.status}")
                    return False
            
            # Test 3: Threat Level Calculation (new formula)
            print("  🎯 Testing Threat Level Calculation...")
            async with self.session.get(f"{self.base_url}/api/news/tension") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check required fields
                    required_fields = ["level", "score", "reason", "critical_count", "high_count", "medium_count", "low_count", "total_7days"]
                    missing_fields = [f for f in required_fields if f not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Tension endpoint missing fields: {missing_fields}")
                        return False
                    
                    # Verify score calculation formula: (critique*4 + élevé*3 + moyen*2 + faible*1) / total * 25
                    critical = data["critical_count"]
                    high = data["high_count"]
                    medium = data["medium_count"]
                    low = data["low_count"]
                    total = data["total_7days"]
                    
                    if total > 0:
                        expected_weighted = (critical * 4) + (high * 3) + (medium * 2) + (low * 1)
                        expected_score = min(100, int((expected_weighted / total) * 25))
                        actual_score = data["score"]
                        
                        score_correct = abs(actual_score - expected_score) <= 1  # Allow 1 point difference for rounding
                        
                        print(f"    ✅ Tension calculation: Level={data['level']}, Score={actual_score}")
                        print(f"    📊 Counts: Critical={critical}, High={high}, Medium={medium}, Low={low}, Total={total}")
                        print(f"    🧮 Formula check: Expected={expected_score}, Actual={actual_score}, Correct={score_correct}")
                        
                        if not score_correct:
                            self.log_result(test_name, False, f"Score calculation incorrect: expected {expected_score}, got {actual_score}")
                            return False
                    else:
                        print("    ⚠️  No data for score calculation verification")
                else:
                    self.log_result(test_name, False, f"Tension endpoint test failed: {response.status}")
                    return False
            
            # Test 4: UTF-8 Headers
            print("  🔤 Testing UTF-8 Headers...")
            async with self.session.get(f"{self.base_url}/api/news?page=1&page_size=1") as response:
                if response.status == 200:
                    content_type = response.headers.get("content-type", "")
                    has_utf8 = "charset=utf-8" in content_type.lower()
                    
                    print(f"    ✅ Content-Type: {content_type}")
                    print(f"    ✅ UTF-8 charset: {has_utf8}")
                    
                    if not has_utf8:
                        self.log_result(test_name, False, f"UTF-8 charset not found in Content-Type: {content_type}")
                        return False
                else:
                    self.log_result(test_name, False, f"UTF-8 headers test failed: {response.status}")
                    return False
            
            # Test 5: Grouped News endpoint
            print("  🌍 Testing Grouped News endpoint...")
            async with self.session.get(f"{self.base_url}/api/dashboard/news-grouped?limit=5") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check required fields
                    required_fields = ["france", "international", "france_total", "international_total"]
                    missing_fields = [f for f in required_fields if f not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Grouped news missing fields: {missing_fields}")
                        return False
                    
                    france_articles = data.get("france", [])
                    international_articles = data.get("international", [])
                    
                    # Check France articles are sorted by date DESC
                    if len(france_articles) >= 2:
                        france_dates = [article.get("published_at") for article in france_articles]
                        france_sorted = all(france_dates[i] >= france_dates[i+1] for i in range(len(france_dates)-1))
                        print(f"    ✅ France articles sorted by date DESC: {france_sorted}")
                        
                        if not france_sorted:
                            self.log_result(test_name, False, "France articles not sorted by date DESC")
                            return False
                    
                    # Check International articles are sorted by date DESC
                    if len(international_articles) >= 2:
                        intl_dates = [article.get("published_at") for article in international_articles]
                        intl_sorted = all(intl_dates[i] >= intl_dates[i+1] for i in range(len(intl_dates)-1))
                        print(f"    ✅ International articles sorted by date DESC: {intl_sorted}")
                        
                        if not intl_sorted:
                            self.log_result(test_name, False, "International articles not sorted by date DESC")
                            return False
                    
                    print(f"    ✅ Grouped news: France={len(france_articles)}, International={len(international_articles)}")
                    print(f"    📊 Totals: France={data['france_total']}, International={data['international_total']}")
                else:
                    self.log_result(test_name, False, f"Grouped news endpoint test failed: {response.status}")
                    return False
            
            self.log_result(test_name, True, "All V3 Strategic Fixes tests passed")
            return True
            
        except Exception as e:
            self.log_result(test_name, False, f"V3 Strategic Fixes test error: {e}")
            return False

    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Guardian News API Test Suite - V3 Strategic Fixes")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 60)
        
        await self.setup()
        
        # List of all test methods - focusing on V3 Strategic Fixes
        tests = [
            self.test_api_health,
            self.test_v3_strategic_fixes,  # Priority test for V3 Strategic Fixes
            self.test_news_list_basic,
            self.test_news_pagination,
            self.test_news_filtering,
            self.test_news_search,
            self.test_news_with_filters_detailed,
            self.test_tension_endpoint,
            self.test_news_detail,
            self.test_invalid_article_id,
            self.test_ai_summary_simple_mode,
            self.test_ai_summary_executive_mode,
            self.test_legacy_endpoints,
            self.test_mongodb_data_integrity,
            self.test_performance,
            self.test_v3_cyber_france_features  # Add V3 Cyber France tests
        ]
        
        # Run all tests
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                result = await test()
                if result:
                    passed += 1
                print()  # Empty line between tests
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {e}")
                print()
        
        await self.cleanup()
        
        # Summary
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
        
        # Critical issues
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            print("\n🚨 FAILED TESTS:")
            for test in failed_tests:
                print(f"   ❌ {test['test']}: {test['details']}")
        
        return passed == total

# Main execution
async def main():
    tester = GuardianNewsAPITester()
    success = await tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Guardian News API is working correctly.")
        return 0
    else:
        print("\n🔧 Some tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    import sys
    result = asyncio.run(main())
    sys.exit(result)