import sqlite3
import os
from werkzeug.security import generate_password_hash

# Correct database directory path relative to backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))     # /backend/database
DB_PATH = os.path.join(BASE_DIR, "smart_school.db")        # backend/database/smart_school.db

def init_db():
    print("📌 Initializing Smart School Database…")
    print(f"📁 Database Path: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # USERS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)

    # STUDENTS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        class_name TEXT,
        section TEXT
    )
    """)

    # TEACHERS TABLE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        subject TEXT
    )
    """)

    # FACE EMBEDDINGS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS face_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER,
        role TEXT,
        embedding BLOB
    )
    """)

    # STUDENT ATTENDANCE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        date TEXT,
        status TEXT
    )
    """)

    # TEACHER ATTENDANCE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS teacher_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        date TEXT,
        status TEXT
    )
    """)

    print("✔ All tables created successfully")

    # CREATE DEFAULT ADMIN WITH HASHED PASSWORD
    hashed_pw = generate_password_hash("admin123")

    cur.execute("""
        INSERT OR IGNORE INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    """, ("Admin", "admin@school.com", hashed_pw, "admin"))

    print("✔ Default admin created with hashed password")
    print("   Email: admin@school.com")
    print("   Password: admin123")

    conn.commit()
    conn.close()
    print("🎉 Database setup completed successfully!")


if __name__ == "__main__":
    init_db()
