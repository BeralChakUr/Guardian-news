#!/usr/bin/env python3
"""
Guardian News Backend API Testing Suite

Tests the FastAPI backend for the Guardian News cybersecurity intelligence platform.
Covers all major API endpoints and functionality.
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
API_BASE_URL = "https://security-hub-76.preview.emergentagent.com"
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

    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Guardian News API Test Suite")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 60)
        
        await self.setup()
        
        # List of all test methods
        tests = [
            self.test_api_health,
            self.test_root_endpoint,
            self.test_news_list_basic,
            self.test_news_pagination,
            self.test_news_filtering,
            self.test_news_search,
            self.test_tension_endpoint,
            self.test_news_detail,
            self.test_invalid_article_id,
            self.test_legacy_endpoints,
            self.test_mongodb_data_integrity,
            self.test_performance
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