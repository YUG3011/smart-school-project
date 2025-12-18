from smart_school_backend.utils.db import get_db

def create_teacher_attendance_table():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teacher_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            marked_at TEXT,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        )
    """)

    # Migration: if existing table lacks 'marked_at', add the column
    try:
        cursor.execute("PRAGMA table_info(teacher_attendance)")
        cols = [r[1] for r in cursor.fetchall()]
        if 'marked_at' not in cols:
            cursor.execute("ALTER TABLE teacher_attendance ADD COLUMN marked_at TEXT")
    except Exception:
        # best-effort migration; ignore errors to avoid blocking startup
        pass

    db.commit()


def add_teacher_attendance(teacher_id, date, status, marked_at):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        INSERT INTO teacher_attendance (teacher_id, date, status, marked_at)
        VALUES (?, ?, ?, ?)
    """, (teacher_id, date, status, marked_at))

    db.commit()


def get_teacher_attendance_by_date(date):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT * FROM teacher_attendance WHERE date = ?
    """, (date,))

    rows = cursor.fetchall()
    return rows


def get_teacher_attendance_history(teacher_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT * FROM teacher_attendance WHERE teacher_id = ?
    """, (teacher_id,))

    rows = cursor.fetchall()
    return rows
