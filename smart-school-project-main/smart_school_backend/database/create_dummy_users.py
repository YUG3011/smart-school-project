import sqlite3
import os
try:
    from werkzeug.security import generate_password_hash
    HAS_WERKZEUG = True
except ImportError:
    HAS_WERKZEUG = False

DB_PATH = os.path.join(os.path.dirname(__file__), "smart_school.db")

def create_dummy_users():
    print(f"📂 Database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    def create_account(role, table, email, password, name, extra_fields):
        print(f"\n--- Setting up {role} ({email}) ---")
        
        # 1. Clean up existing records in users and profile table
        cursor.execute("DELETE FROM users WHERE email = ?", (email,))
        cursor.execute(f"DELETE FROM {table} WHERE email = ?", (email,))
        
        # 2. Insert into USERS table first to get a valid unique ID
        hashed_pw = generate_password_hash(password) if HAS_WERKZEUG else password
        
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                (name, email, hashed_pw, role)
            )
            user_id = cursor.lastrowid
            print(f"✔ Created user in 'users' table with ID: {user_id}")
        except Exception as e:
            print(f"❌ Error inserting into users: {e}")
            return

        # 3. Insert into PROFILE table (teachers/students) using the SAME ID
        cols = ["id", "name", "email"]
        vals = [user_id, name, email]
        
        for k, v in extra_fields.items():
            cols.append(k)
            vals.append(v)
            
        placeholders = ", ".join(["?"] * len(cols))
        col_names = ", ".join(cols)
        
        try:
            cursor.execute(f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})", vals)
            print(f"✔ Created profile in '{table}' with ID: {user_id}")
        except Exception as e:
            print(f"❌ Error inserting into {table}: {e}")

    # Create Teacher
    create_account(
        role="teacher", 
        table="teachers", 
        email="teacher@school.com", 
        password="teacher123", 
        name="Demo Teacher",
        extra_fields={"subject": "Science"}
    )

    # Create Student
    create_account(
        role="student", 
        table="students", 
        email="student@school.com", 
        password="student123", 
        name="Demo Student",
        extra_fields={"class_name": "10", "section": "A"}
    )

    conn.commit()
    conn.close()
    print("\n🎉 Done! You can now login.")

if __name__ == "__main__":
    create_dummy_users()