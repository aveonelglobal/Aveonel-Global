import requests
import sys
import json
from datetime import datetime

class AveonelBackendTester:
    def __init__(self):
        self.base_url = "https://pilot-launch-4.preview.emergentagent.com/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            result = {
                'test': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'response_data': None
            }
            
            try:
                response_json = response.json()
                result['response_data'] = response_json
            except:
                result['response_data'] = response.text

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if result['response_data']:
                    print(f"   Response: {json.dumps(result['response_data'], indent=2)[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {result['response_data']}")

            self.test_results.append(result)
            return success, result['response_data']

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Request Error: {str(e)}")
            self.test_results.append({
                'test': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'REQUEST_ERROR',
                'success': False,
                'error': str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("API Root", "GET", "/", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "/health", 200)

    def test_admin_auth_flow(self):
        """Test admin registration and login"""
        print("\n" + "="*50)
        print("TESTING ADMIN AUTH FLOW")
        print("="*50)
        
        test_timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_admin_{test_timestamp}@aveonel.com"
        test_password = "TestPass123!"
        test_name = f"Test Admin {test_timestamp}"
        
        # Test admin registration
        register_data = {
            "email": test_email,
            "password": test_password,
            "name": test_name
        }
        
        success, response = self.run_test(
            "Admin Registration", 
            "POST", 
            "/auth/register", 
            200, 
            register_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Token obtained: {self.token[:20]}...")
        else:
            print("   ❌ Failed to get token from registration")
            return False
            
        # Test login with same credentials
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login", 
            200,
            login_data
        )
        
        if success and 'access_token' in response:
            print("   ✅ Login successful")
        else:
            print("   ❌ Login failed")
            return False
            
        # Test get current user
        self.run_test("Get Current User", "GET", "/auth/me", 200)
        
        return True

    def test_pilot_application_flow(self):
        """Test pilot application submission"""
        print("\n" + "="*50)
        print("TESTING PILOT APPLICATION FLOW")
        print("="*50)
        
        test_timestamp = datetime.now().strftime('%H%M%S')
        
        # Test pilot application submission
        pilot_data = {
            "name": f"Test Applicant {test_timestamp}",
            "email": f"applicant_{test_timestamp}@example.com",
            "phone": "416-555-0123",
            "business_type": "Life Coach",
            "revenue_range": "3k_to_5k",
            "biggest_challenge": "I struggle with scheduling clients efficiently and managing my pipeline. Need better systems to track client progress and automate onboarding.",
            "ontario_based": True
        }
        
        success, response = self.run_test(
            "Pilot Application Submission",
            "POST",
            "/pilot/apply",
            200,
            pilot_data
        )
        
        if success and response.get('success'):
            print(f"   ✅ Application submitted with ID: {response.get('application_id')}")
            return True
        else:
            print("   ❌ Application submission failed")
            return False
            
    def test_ontario_validation(self):
        """Test Ontario-based validation"""
        print("\n" + "="*50)
        print("TESTING ONTARIO VALIDATION")
        print("="*50)
        
        test_timestamp = datetime.now().strftime('%H%M%S')
        
        # Test application with ontario_based = False
        invalid_pilot_data = {
            "name": f"Non-Ontario Applicant {test_timestamp}",
            "email": f"non_ontario_{test_timestamp}@example.com",
            "phone": "416-555-0124",
            "business_type": "Business Coach",
            "revenue_range": "5k_to_10k",
            "biggest_challenge": "Need help with operations management and client tracking systems.",
            "ontario_based": False
        }
        
        self.run_test(
            "Non-Ontario Application (Should Fail)",
            "POST",
            "/pilot/apply",
            400,
            invalid_pilot_data
        )

    def test_client_management(self):
        """Test client CRUD operations (requires auth)"""
        print("\n" + "="*50)
        print("TESTING CLIENT MANAGEMENT")
        print("="*50)
        
        if not self.token:
            print("   ❌ No auth token available - skipping client tests")
            return False
            
        # Test get all clients
        success, clients = self.run_test("Get All Clients", "GET", "/clients", 200)
        
        if success:
            print(f"   ✅ Found {len(clients)} clients")
            
            # If we have clients, test updating one
            if clients and len(clients) > 0:
                client_id = clients[0]['id']
                
                # Test update client stage
                update_data = {"pipeline_stage": "contacted"}
                self.run_test(
                    f"Update Client Stage",
                    "PUT",
                    f"/clients/{client_id}",
                    200,
                    update_data
                )
                
                # Test get single client
                self.run_test(
                    f"Get Single Client",
                    "GET", 
                    f"/clients/{client_id}",
                    200
                )

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD STATS")
        print("="*50)
        
        if not self.token:
            print("   ❌ No auth token available - skipping dashboard tests")
            return False
            
        success, stats = self.run_test("Dashboard Stats", "GET", "/dashboard/stats", 200)
        
        if success and stats:
            print(f"   ✅ Dashboard stats retrieved:")
            print(f"      Total leads: {stats.get('total_leads', 0)}")
            print(f"      New leads: {stats.get('new_leads', 0)}")
            print(f"      Active pilots: {stats.get('active_pilots', 0)}")
            print(f"      Pilot spots remaining: {stats.get('pilot_spots_remaining', 0)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Aveonel Global API Tests")
        print(f"Backend URL: {self.base_url}")
        
        # Run tests in sequence
        self.test_health_endpoints()
        
        auth_success = self.test_admin_auth_flow()
        if auth_success:
            self.test_client_management()
            self.test_dashboard_stats()
        
        self.test_pilot_application_flow()
        self.test_ontario_validation()
        
        # Print summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: Expected {test['expected_status']}, got {test['actual_status']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AveonelBackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())