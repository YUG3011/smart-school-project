from smart_school_backend.utils.db import get_db


def create_student_table():   # ✔ corrected name (no 's')
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            id_code TEXT UNIQUE,
            class_name TEXT NOT NULL,
            age INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    db.commit()

    # Ensure `id_code` column exists on older databases
    try:
        cursor.execute("PRAGMA table_info(students)")
        cols = [r[1] for r in cursor.fetchall()]
        if "id_code" not in cols:
            cursor.execute("ALTER TABLE students ADD COLUMN id_code TEXT UNIQUE")
            db.commit()
    except Exception:
        pass

def get_all_students():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id, name, email, class_name, age FROM students")
    return cursor.fetchall()
