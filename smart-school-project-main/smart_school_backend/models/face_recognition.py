import sqlite3
import numpy as np
import cv2
import face_recognition
from utils.db import get_db

# -------------------------------------------------------------
# Create Table
# -------------------------------------------------------------
def create_face_embeddings_table():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            embedding BLOB NOT NULL
        )
    """)
    db.commit()


# -------------------------------------------------------------
# Extract Face Embedding from Base64
# -------------------------------------------------------------
def extract_face_embeddings(image_base64):
    try:
        img_bytes = np.frombuffer(base64.b64decode(image_base64.split(",")[-1]), np.uint8)
        img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb)

        if len(boxes) == 0:
            return None

        encodings = face_recognition.face_encodings(rgb, boxes)
        if len(encodings) == 0:
            return None

        return encodings[0]  # 128-dim vector

    except Exception as e:
        print("Face extract error:", e)
        return None


# -------------------------------------------------------------
# Save Embedding to Database
# -------------------------------------------------------------
def save_face_embedding(person_id, name, email, role, embedding):
    db = get_db()
    db.execute("""
        INSERT INTO face_embeddings (person_id, name, email, role, embedding)
        VALUES (?, ?, ?, ?, ?)
    """, (person_id, name, email, role, embedding.tobytes()))
    db.commit()


# -------------------------------------------------------------
# Read All Embeddings
# -------------------------------------------------------------
def get_all_embeddings():
    db = get_db()
    rows = db.execute("SELECT * FROM face_embeddings").fetchall()

    embeddings = []
    for row in rows:
        emb_vec = np.frombuffer(row["embedding"], dtype=np.float64)
        embeddings.append({
            "id": row["id"],
            "person_id": row["person_id"],
            "name": row["name"],
            "email": row["email"],
            "role": row["role"],
            "embedding": emb_vec,
        })
    return embeddings


# -------------------------------------------------------------
# Compare Input Embedding with Saved Ones
# -------------------------------------------------------------
def recognize_face(input_embedding, stored_embeddings, threshold=0.6):
    best_match = None
    min_dist = 999

    for row in stored_embeddings:
        dist = np.linalg.norm(input_embedding - row["embedding"])
        if dist < min_dist:
            min_dist = dist
            best_match = row

    if min_dist <= threshold:
        return best_match

    return None
