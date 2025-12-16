import sqlite3
import os
import numpy as np

# =========================
# DATABASE PATH RESOLUTION
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "database", "smart_school.db")


def get_connection():
    """
    Returns a new SQLite connection to smart_school.db
    """
    return sqlite3.connect(DB_PATH)


# ========================================================
# 1. CREATE face_embeddings TABLE  (Fixes your import bug)
# ========================================================

def create_face_embeddings_table():
    """
    Creates face_embeddings table if it does not exist.
    This function MUST exist because app.py imports it.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            face_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            class_name TEXT,
            section TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            embedding BLOB NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print("✔ face_embeddings table verified/created.")


# ========================================================
# 2. STORE OR UPDATE FACE EMBEDDING
# ========================================================

def store_face_embedding(role, face_id, name, email, class_name, section, embedding):
    """
    Saves or updates face embeddings in DB.
    The embedding comes as a NumPy array.
    """
    conn = get_connection()
    cur = conn.cursor()

    embedding_blob = embedding.astype(np.float32).tobytes()

    cur.execute("""
        INSERT INTO face_embeddings (role, face_id, name, email, class_name, section, embedding)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(face_id)
        DO UPDATE SET 
            name = excluded.name,
            email = excluded.email,
            class_name = excluded.class_name,
            section = excluded.section,
            embedding = excluded.embedding
    """, (role, face_id, name, email, class_name, section, embedding_blob))

    conn.commit()
    conn.close()


# ========================================================
# 3. LOAD STORED EMBEDDINGS
# ========================================================

def load_all_embeddings():
    """
    Loads all embeddings from DB and returns:
    [
        {
            "role": "student",
            "face_id": "ST10001",
            "name": "Cheta",
            "email": "...",
            "class_name": "...",
            "section": "...",
            "embedding": numpy.ndarray
        }
    ]
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT role, face_id, name, email, class_name, section, embedding
        FROM face_embeddings
    """)

    rows = cur.fetchall()
    conn.close()

    embeddings = []
    for role, face_id, name, email, class_name, section, emb_blob in rows:
        emb_array = np.frombuffer(emb_blob, dtype=np.float32)

        embeddings.append({
            "role": role,
            "face_id": face_id,
            "name": name,
            "email": email,
            "class_name": class_name,
            "section": section,
            "embedding": emb_array
        })

    return embeddings
