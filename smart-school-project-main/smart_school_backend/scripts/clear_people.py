"""
Small maintenance script to clear students, teachers, and face_embeddings tables.
Run from project root or backend folder.
"""
import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database", "smart_school.db"))

def clear_tables():
    print("Using DB:", DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    try:
        cur.execute("PRAGMA foreign_keys = OFF;")
    except Exception:
        pass
    tables = ["face_embeddings", "student_attendance", "teacher_attendance", "students", "teachers"]
    for t in tables:
        try:
            cur.execute(f"DELETE FROM {t};")
            print(f"Cleared {t}")
        except Exception as e:
            print(f"Skipping {t}: {e}")
    try:
        conn.commit()
        cur.execute("VACUUM;")
    except Exception:
        pass
    conn.close()
    print("Done.")

if __name__ == '__main__':
    clear_tables()
