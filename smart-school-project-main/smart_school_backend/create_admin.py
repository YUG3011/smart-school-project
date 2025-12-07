# create_admin.py
import bcrypt
from smart_school_backend.app import app
from smart_school_backend.utils.db import get_db
from smart_school_backend.database.init_db import initialize_database

def create_admin():
    print("Executing create_admin (v2)...")
    with app.app_context():
        initialize_database()  # ensure tables exist
        
        print("... getting db connection in create_admin.")
        conn = get_db()
        cursor = conn.cursor()

        name = "Super Admin"
        email = "admin@school.com"
        password = "admin123"
        role = "Admin"

        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        try:
            # Check if admin already exists
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                print("ℹ️ Admin user already exists.")
                return

            cursor.execute(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                (name, email, hashed_pw, role)
            )
            conn.commit()
            print("✅ Admin user created successfully")
            print("Login Email: admin@school.com")
            print("Password: admin123")
        except Exception as e:
            # This is the only place an error should happen now
            print(f"❌ A database error occurred: {e}")

if __name__ == "__main__":
    create_admin()