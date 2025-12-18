import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'smart_school.db'))
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

for t in ['students','teachers','face_embeddings','student_attendance','teacher_attendance']:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        n = cur.fetchone()[0]
    except Exception as e:
        n = f'error: {e}'
    print(f"{t}: {n}")

conn.close()
