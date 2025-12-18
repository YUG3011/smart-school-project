# models/teacher.py
from smart_school_backend.utils.db import get_db


def create_teacher_table():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            id_code TEXT UNIQUE,
            subject TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    db.commit()

    # Ensure `id_code` column exists on older databases
    try:
        cursor.execute("PRAGMA table_info(teachers)")
        cols = [r[1] for r in cursor.fetchall()]
        if "id_code" not in cols:
            cursor.execute("ALTER TABLE teachers ADD COLUMN id_code TEXT UNIQUE")
            db.commit()
    except Exception:
        pass
