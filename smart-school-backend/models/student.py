from utils.db import get_db

def create_student_table():   # ✔ corrected name (no 's')
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            class_name TEXT NOT NULL,
            age INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    db.commit()


def get_all_students():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id, name, email, class_name, age FROM students")
    return cursor.fetchall()
