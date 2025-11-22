# create_admin.py
import bcrypt
from utils.db import get_db, init_db

def create_admin():
    init_db()  # ensure tables exist
    conn = get_db()
    cursor = conn.cursor()

    name = "Super Admin"
    email = "admin@school.com"
    password = "admin123"
    role = "Admin"

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (name, email, hashed_pw, role)
        )
        conn.commit()
        print("✅ Admin user created successfully")
        print("Login Email: admin@school.com")
        print("Password: admin123")
    except Exception as e:
        print("⚠️ Error:", e)

if __name__ == "__main__":
    create_admin()
