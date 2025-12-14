# smart_school_backend/models/face_recognition.py

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "smart_school.db")

def get_connection():
    """Returns a database connection."""
    return sqlite3.connect(DB_PATH)

def create_face_embeddings_table():
    """
    Creates the face_embeddings table if it does not already exist.
    This file is ONLY for database schema. Actual recognition happens in routes/face_recognition.py.
    """

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,             -- 'student' or 'teacher'
            face_id TEXT NOT NULL UNIQUE,   -- ST10001 or T1001
            name TEXT,
            email TEXT,
            class_name TEXT,
            section TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            embedding BLOB NOT NULL
        );
    """)

    conn.commit()
    conn.close()
    print("✔ face_embeddings table verified/created.")

def insert_face_embedding(role, face_id, name, email, class_name, section, embedding_bytes):
    """
    Inserts a new embedded face into the database.
    Called by the ENROLL API inside routes/face_recognition.py
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT OR REPLACE INTO face_embeddings
        (role, face_id, name, email, class_name, section, embedding)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (role, face_id, name, email, class_name, section, embedding_bytes))

    conn.commit()
    conn.close()
    return True

def fetch_all_embeddings():
    """
    Returns all stored embeddings for face recognition comparison.
    Used by recognition endpoint (routes/face_recognition.py)
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT role, face_id, name, email, class_name, section, embedding
        FROM face_embeddings
    """)

    rows = cur.fetchall()
    conn.close()
    return rows
