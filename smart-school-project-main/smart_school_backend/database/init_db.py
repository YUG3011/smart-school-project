import sqlite3
import os

# Correct database path
DB_DIR = "database"
DB_PATH = os.path.join(DB_DIR, "smart_school.db")

# Ensure folder exists
os.makedirs(DB_DIR, exist_ok=True)


def init_db():
    print("📌 Initializing Smart School Database")

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

    print("✔ All tables created successfully.")

    # DEFAULT ADMIN USER
    cur.execute("""
        INSERT OR IGNORE INTO users (name, email, password, role)
        VALUES ('Admin', 'admin@school.com', 'admin123', 'admin')
    """)

    print("✔ Default admin created: admin@school.com / admin123")

    conn.commit()
    conn.close()

    print("🎉 Database setup completed successfully!")


if __name__ == "__main__":
    init_db()
