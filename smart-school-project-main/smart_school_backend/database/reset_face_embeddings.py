import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "smart_school.db")

print("Using database:", DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("Dropping old face_embeddings table...")
cursor.execute("DROP TABLE IF EXISTS face_embeddings")

print("Creating new face_embeddings table...")
cursor.execute("""
    CREATE TABLE face_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL,
        embedding BLOB NOT NULL
    )
""")

print("Creating unique index...")
cursor.execute("""
    CREATE UNIQUE INDEX idx_face_person_role
    ON face_embeddings (person_id, role)
""")

conn.commit()
conn.close()

print("✔ face_embeddings table recreated successfully!")
