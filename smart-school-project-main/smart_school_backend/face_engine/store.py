# smart_school_backend/face_engine/store.py

import numpy as np
from smart_school_backend.utils.db import get_db


def save_embedding(person_id, role: str, embedding, name=None, class_name=None, section=None, subject=None):
    """
    Save / update one face embedding for a given person + role.
    Table schema (from init_db.py):
        face_embeddings(id, person_id INTEGER, role TEXT, embedding BLOB)
    """
    db = get_db()
    cur = db.cursor()

    # Remove any existing embedding for this person+role
    cur.execute(
        "DELETE FROM face_embeddings WHERE person_id = ? AND role = ?",
        (person_id, role),
    )

    emb_bytes = embedding.astype("float32").tobytes()

    # Insert with metadata to satisfy NOT NULL constraints on schema
    cur.execute(
        "INSERT INTO face_embeddings (person_id, role, name, class_name, section, subject, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (person_id, role, name or "", class_name or None, section or None, subject or None, emb_bytes),
    )

    db.commit()


def load_all_embeddings():
    """
    Load all stored embeddings.
    Returns list of dicts: {person_id, role, embedding(np.array)}.
    """
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT person_id, role, name, class_name, section, subject, embedding FROM face_embeddings")
    rows = cur.fetchall()

    people = []
    for row in rows:
        person_id = row[0]
        role = row[1]
        name = row[2]
        class_name = row[3]
        section = row[4]
        subject = row[5]
        emb_blob = row[6]
        emb = np.frombuffer(emb_blob, dtype="float32")
        people.append(
            {
                "person_id": person_id,
                "role": role,
                "name": name,
                "class_name": class_name,
                "section": section,
                "subject": subject,
                "embedding": emb,
            }
        )

    return people
