from flask import Blueprint, request, jsonify
import sqlite3
import numpy as np
from smart_school_backend.face_engine.encoder import generate_embedding
from smart_school_backend.utils.db import get_db

recognition_bp = Blueprint("recognition", __name__)

@recognition_bp.route("/recognize", methods=["POST"])
def recognize_face():
    data = request.get_json()
    image_base64 = data.get("image_base64")

    if not image_base64:
        return jsonify({"error": "Image is required"}), 400

    try:
        embedding = generate_embedding(image_base64)
        if embedding is None:
            return jsonify({"match": False, "message": "No face detected"}), 200

        conn = get_db()
        cur = conn.cursor()

        rows = cur.execute("""
            SELECT person_id, role, embedding
            FROM face_embeddings
        """).fetchall()

        best_match = None
        min_distance = 0.6  # threshold

        for row in rows:
            db_embedding = np.frombuffer(row["embedding"], dtype=np.float32)
            dist = np.linalg.norm(embedding - db_embedding)

            if dist < min_distance:
                min_distance = dist
                best_match = row

        if not best_match:
            return jsonify({"match": False}), 200

        person_id = best_match["person_id"]
        role = best_match["role"]

        if role == "student":
            user = cur.execute(
                "SELECT id, name FROM students WHERE id = ?",
                (person_id,)
            ).fetchone()
        else:
            user = cur.execute(
                "SELECT id, name FROM teachers WHERE id = ?",
                (person_id,)
            ).fetchone()

        if user is None:
            return jsonify({"match": False, "message": "User not found"}), 200

        return jsonify({
            "match": True,
            "id": user["id"],
            "name": user["name"],
            "role": role,
            "distance": float(min_distance)
        })

    except Exception as e:
        print("Recognition error:", e)
        return jsonify({"error": "Recognition failed"}), 500
