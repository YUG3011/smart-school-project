import os
import sys
import numpy as np

# Ensure package imports work when running this script from the package folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "database", "smart_school.db"))

if __name__ == '__main__':
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = None
    cur = conn.cursor()

    # Insert a dummy student (name,email,class_name,section)
    cur.execute("INSERT INTO students (name, email, class_name, section) VALUES (?, ?, ?, ?)",
                ("E2E Test", "e2e_test@example.com", "1", "A"))
    conn.commit()
    student_id = cur.lastrowid
    print('Inserted student id=', student_id)

    # Count embeddings before
    cur.execute("SELECT COUNT(*) FROM face_embeddings")
    before = cur.fetchone()[0]
    print('face_embeddings before=', before)

    emb = np.random.rand(128).astype('float32')
    emb_bytes = emb.tobytes()

    # Remove existing and insert new embedding row
    cur.execute("DELETE FROM face_embeddings WHERE person_id = ? AND role = ?", (student_id, 'student'))
    cur.execute(
        "INSERT INTO face_embeddings (person_id, role, name, class_name, section, subject, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (student_id, 'student', 'E2E Test', '1', 'A', None, emb_bytes)
    )
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM face_embeddings")
    after = cur.fetchone()[0]
    print('face_embeddings after=', after)
    conn.close()
