import requests

BASE = "http://127.0.0.1:5000"

print("\n===== LOGIN =====")
login_res = requests.post(f"{BASE}/auth/login", json={
    "email": "admin@school.com",
    "password": "admin123",
    "role": "Admin"
})

print(login_res.status_code, login_res.text)

try:
    token = login_res.json().get("token", None)
except:
    token = None

if not token:
    print("❌ ERROR: Login did not return a token")
    exit()

print("\nToken Loaded:", token[:50], "...")

headers = {"Authorization": f"Bearer {token}"}

# GET Students
print("\n===== GET STUDENTS =====")
res = requests.get(f"{BASE}/students/", headers=headers)
print(res.status_code, res.text)

# ADD Student
print("\n===== ADD STUDENT =====")
res = requests.post(
    f"{BASE}/students/",
    json={"name": "API Student", "email": "api@example.com", "class_name": "10A"},
    headers=headers
)
print(res.status_code, res.text)

# GET Students again
print("\n===== STUDENTS AFTER ADD =====")
res = requests.get(f"{BASE}/students/", headers=headers)
print(res.status_code, res.text)

# UPDATE Student (ID=1)
print("\n===== UPDATE STUDENT ID=1 =====")
res = requests.put(
    f"{BASE}/students/1",
    json={"name": "Updated Name"},
    headers=headers
)
print(res.status_code, res.text)

# DELETE Student
print("\n===== DELETE STUDENT ID=1 =====")
res = requests.delete(f"{BASE}/students/1", headers=headers)
print(res.status_code, res.text)
