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
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        token = response.json()["token"]   # corrected field
        print("✔ Login successful")
        return token
    else:
        print("❌ Login failed:", response.text)
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
# 2️⃣ TEST STUDENTS CRUD
# -------------------------------------------------------------------
def test_students(token):

    print("\n===== ADD STUDENT =====")
    r = requests.post(
        f"{BASE_URL}/api/students/",
        headers=auth_headers(token),
        json={"name": "API Student", "email": "api@example.com", "class_name": "10A"}
    )
    print(r.status_code, r.text)

    print("\n===== GET STUDENTS =====")
    r = requests.get(
        f"{BASE_URL}/api/students/",
        headers=auth_headers(token)
    )
    print(r.status_code, r.text)

    students = r.json()
    first_id = students[0]["id"]

    print(f"\n===== UPDATE STUDENT ID={first_id} =====")
    r = requests.put(
        f"{BASE_URL}/api/students/{first_id}",
        headers=auth_headers(token),
        json={"name": "Updated Name", "email": "updated@example.com", "class_name": "12B"}
    )
    print(r.status_code, r.text)

    print(f"\n===== DELETE STUDENT ID={first_id} =====")
    r = requests.delete(
        f"{BASE_URL}/api/students/{first_id}",
        headers=auth_headers(token)
    )
    print(r.status_code, r.text)


# -------------------------------------------------------------------
# MAIN FLOW
# -------------------------------------------------------------------
if __name__ == "__main__":

    token = login()
    if not token:
        print("❌ Stopping tests (login failed).")
        exit()

    test_students(token)

    print("\n🎉 ALL TESTS COMPLETE")
