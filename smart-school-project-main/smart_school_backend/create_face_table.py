import sqlite3

db_path = "smart_school.db"  # adjust if your DB file is somewhere else

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS face_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    face_id TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    class_name TEXT,
    section TEXT,
    created_at TEXT,
    embedding BLOB NOT NULL
);
""")

conn.commit()
conn.close()

print("face_embeddings table created successfully.")
