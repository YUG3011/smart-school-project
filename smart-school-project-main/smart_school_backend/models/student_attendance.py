from datetime import date, datetime
from smart_school_backend.utils.db import get_db


def create_student_attendance_table():
    db = get_db()
    cur = db.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS student_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            marked_at TEXT NOT NULL,
            UNIQUE(student_id, date)
        )
    """)

    db.commit()


def mark_student_present_once(student_id: int) -> bool:
    db = get_db()
    cur = db.cursor()

    today = date.today().isoformat()

    # Check if already marked
    cur.execute(
        "SELECT id FROM student_attendance WHERE student_id = ? AND date = ?",
        (student_id, today)
    )
    if cur.fetchone():
        return False

    # Insert attendance
    cur.execute(
        """
        INSERT INTO student_attendance (student_id, date, status, marked_at)
        VALUES (?, ?, ?, ?)
        """,
        (student_id, today, "present", datetime.utcnow().isoformat())
    )

    db.commit()
    return True
