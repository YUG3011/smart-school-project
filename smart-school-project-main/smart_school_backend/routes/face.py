from flask import Blueprint, jsonify
from smart_school_backend.utils.db import get_db

face_bp = Blueprint("face", __name__)

@face_bp.route("/enrolled-ids", methods=["GET"])
def get_enrolled_ids():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT person_id FROM face_embeddings")
        rows = cur.fetchall()
        enrolled_ids = [row["person_id"] for row in rows]
        return jsonify({"enrolled_ids": enrolled_ids})
    except Exception as e:
        print("Error fetching enrolled IDs:", e)
        return jsonify({"error": "Failed to fetch enrolled IDs"}), 500
