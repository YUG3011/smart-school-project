import requests
import json

BASE_URL = "http://127.0.0.1:5000"

# -------------------------------------------------------------------
# 1️⃣ LOGIN AND GET TOKEN
# -------------------------------------------------------------------
def login():
    url = f"{BASE_URL}/api/auth/login"
    payload = {
        "email": "admin@school.com",
        "password": "admin123",
        "role": "Admin"
    }

    print("\n===== LOGIN =====")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        if response.status_code == 200:
            token = response.json().get("token")
            if token:
                print("✔ Login successful")
                return token
            else:
                print("❌ Login failed: Token not in response.")
                return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Login failed: {e}")
        return None


# -------------------------------------------------------------------
# Helper: Authorized headers
# -------------------------------------------------------------------
def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


# -------------------------------------------------------------------
# 2️⃣ TEST TEACHERS
# -------------------------------------------------------------------
def get_or_create_teacher(token):
    """Gets the first teacher or creates one if none exist."""
    print("\n===== GET OR CREATE TEACHER =====")
    url = f"{BASE_URL}/api/teachers/"
    headers = auth_headers(token)
    
    try:
        # Get list of teachers
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        teachers = response.json()

        if teachers:
            first_teacher = teachers[0]
            print(f"✔ Using existing teacher: {first_teacher['name']} (ID: {first_teacher['id']})")
            return first_teacher['id']
        else:
            # Create a new teacher if none exist
            print("No teachers found. Creating a new one for tests.")
            teacher_payload = {"name": "API Test Teacher", "email": "api.teacher@school.com", "subject": "Testing"}
            response = requests.post(url, headers=headers, json=teacher_payload)
            response.raise_for_status()
            
            # Re-fetch the teacher list to get the ID
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            new_teacher = response.json()[0]
            print(f"✔ Created new teacher: {new_teacher['name']} (ID: {new_teacher['id']})")
            return new_teacher['id']
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to get or create teacher: {e}")
        return None

# -------------------------------------------------------------------
# 3️⃣ TEST TEACHER ATTENDANCE
# -------------------------------------------------------------------
def test_teacher_attendance(token, teacher_id):
    if not teacher_id:
        print("❌ Skipping teacher attendance tests (no teacher ID).")
        return

    print("\n===== TEST TEACHER ATTENDANCE =====")
    url_mark = f"{BASE_URL}/api/teacher-attendance/mark"
    url_today = f"{BASE_URL}/api/teacher-attendance/today"
    url_history = f"{BASE_URL}/api/teacher-attendance/teacher/{teacher_id}"
    headers = auth_headers(token)

    try:
        # 1. Mark attendance
        print("\n--- Mark 'Present' ---")
        payload = {"teacher_id": teacher_id, "status": "Present"}
        response = requests.post(url_mark, headers=headers, json=payload)
        # This might be 400 if already marked today, which is fine for rerunning tests
        if response.status_code == 201:
            print(f"✔ {response.status_code}: Attendance marked successfully.")
        elif response.status_code == 400 and "already marked" in response.text:
            print(f"✔ {response.status_code}: Attendance was already marked for today (expected on re-run).")
        else:
            response.raise_for_status()

        # 2. Mark attendance again (should fail)
        print("\n--- Mark 'Present' again (should be blocked) ---")
        response = requests.post(url_mark, headers=headers, json=payload)
        if response.status_code == 400:
            print(f"✔ {response.status_code}: Successfully blocked duplicate attendance marking.")
        else:
            print(f"❌ FAILED: Duplicate marking was not blocked. Status: {response.status_code}")

        # 3. Get today's attendance
        print("\n--- Get Today's Attendance ---")
        response = requests.get(url_today, headers=headers)
        response.raise_for_status()
        print(f"✔ {response.status_code}: Got today's attendance records.")
        print(json.dumps(response.json(), indent=2))

        # 4. Get teacher's history
        print(f"\n--- Get History for Teacher ID={teacher_id} ---")
        response = requests.get(url_history, headers=headers)
        response.raise_for_status()
        print(f"✔ {response.status_code}: Got attendance history.")
        print(json.dumps(response.json(), indent=2))

    except requests.exceptions.RequestException as e:
        print(f"❌ An error occurred during attendance tests: {e}")


# -------------------------------------------------------------------
# MAIN FLOW
# -------------------------------------------------------------------
if __name__ == "__main__":
    api_token = login()
    if not api_token:
        print("❌ Stopping tests (login failed).")
        exit()

    # Get a teacher to run tests on
    test_teacher_id = get_or_create_teacher(api_token)

    # Run attendance tests
    test_teacher_attendance(api_token, test_teacher_id)

    print("\n🎉 ALL TESTS COMPLETE")
