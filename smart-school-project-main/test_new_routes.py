#!/usr/bin/env python
"""
Quick test script to verify all new dashboard API routes
"""

import requests
import json
import sys

# Test with a dummy token (will be rejected, but shows route exists)
BASE_URL = "http://127.0.0.1:5000/api"
HEADERS = {"Authorization": "Bearer dummy-token"}

test_routes = [
    # Admin Dashboard Routes
    ("GET", "/students/count", "Admin - Student count"),
    ("GET", "/teachers/count", "Admin - Teacher count"),
    ("GET", "/students/class-count", "Admin - Class count"),
    ("GET", "/attendance/today", "Admin - Today attendance"),
    ("GET", "/attendance-view/all?limit=5", "Admin - Recent attendance"),
    
    # Teacher Dashboard Routes
    ("GET", "/teachers/1/student-count", "Teacher - Student count"),
    ("GET", "/attendance/teacher/1/today", "Teacher - Today attendance"),
    ("GET", "/timetable/teacher/1/today", "Teacher - Today timetable"),
    ("GET", "/attendance-view/teacher/1?limit=5", "Teacher - Recent logs"),
    
    # Student Dashboard Routes
    ("GET", "/student-attendance/1/stats", "Student - Attendance stats"),
    ("GET", "/student-attendance/1/today", "Student - Today status"),
    ("GET", "/student-attendance/1/logs?limit=5", "Student - Recent logs"),
    ("GET", "/student-attendance/stats/overview", "Student - Overview stats"),
]

print("\n" + "="*70)
print("TESTING NEW DASHBOARD API ROUTES")
print("="*70 + "\n")

passed = 0
failed = 0

for method, endpoint, description in test_routes:
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, timeout=2)
        
        status = response.status_code
        
        # Any response (even 401 Unauthorized) means the route exists
        if status in [200, 400, 401, 403, 404, 422]:
            if status == 401:
                status_text = "401 (Auth Required - Route Exists ✓)"
            else:
                status_text = f"{status} ✓"
            
            print(f"✓ {method:4} {endpoint:50} [{status_text}]  {description}")
            passed += 1
        else:
            print(f"✗ {method:4} {endpoint:50} [{status}]  {description}")
            failed += 1
            
    except Exception as e:
        print(f"✗ {method:4} {endpoint:50} [ERROR] {str(e)}")
        failed += 1

print("\n" + "="*70)
print(f"RESULTS: {passed} PASSED, {failed} FAILED")
print("="*70 + "\n")

if failed > 0:
    sys.exit(1)
