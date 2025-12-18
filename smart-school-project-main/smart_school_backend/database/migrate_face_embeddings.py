import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "smart_school.db")

print("Using DB:", DB_PATH)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print("Dropping old face_embeddings table…")
cur.execute("DROP TABLE IF EXISTS face_embeddings")

print("Creating unified face_embeddings table…")
cur.execute("""
    CREATE TABLE face_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        class_name TEXT,
        section TEXT,
        subject TEXT,
        embedding BLOB NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
""")

conn.commit()
conn.close()

print("✔ Unified face_embeddings table created successfully!")
