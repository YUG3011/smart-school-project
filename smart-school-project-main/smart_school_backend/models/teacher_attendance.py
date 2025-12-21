from datetime import date, datetime
from smart_school_backend.utils.db import get_db


def create_teacher_attendance_table():
    db = get_db()
    cur = db.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS teacher_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            marked_at TEXT NOT NULL,
            UNIQUE(teacher_id, date)
        )
    """)

    db.commit()


def mark_teacher_present_once(teacher_id: int) -> bool:
    db = get_db()
    cur = db.cursor()

    today = date.today().isoformat()

    # Check if already marked
    cur.execute(
        "SELECT id FROM teacher_attendance WHERE teacher_id = ? AND date = ?",
        (teacher_id, today)
    )
    if cur.fetchone():
        return False

    # Insert attendance
    cur.execute(
        """
        INSERT INTO teacher_attendance (teacher_id, date, status, marked_at)
        VALUES (?, ?, ?, ?)
        """,
        (teacher_id, today, "present", datetime.utcnow().isoformat())
    )

    db.commit()
    return True
