import base64
import numpy as np
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from smart_school_backend.face_engine.encoder import encode_image_base64
from smart_school_backend.face_engine.store import save_embedding
from smart_school_backend.utils.db import get_db

enrollment_bp = Blueprint("enrollment_bp", __name__)

# ==========================================================
# POST /api/face/enroll
# Unified Student / Teacher Face Enrollment
# ==========================================================
@enrollment_bp.route("/enroll", methods=["POST"])
@jwt_required()
def enroll_face():
    try:
        data = request.get_json() or {}

        role = data.get("role")        # "student" | "teacher"
        user_id = data.get("user_id")  # integer
        image_b64 = data.get("image")  # base64 string

        if not role or not user_id or not image_b64:
            return jsonify({"error": "Missing role, user_id, or image"}), 400

        # --------------------------------------------------
        # Generate embedding using encoder
        # --------------------------------------------------
        embeddings = encode_image_base64(image_b64)

        if not embeddings:
            return jsonify({"error": "No face detected"}), 400

        embedding = np.array(embeddings[0], dtype=np.float32)

        # Lookup user metadata to store alongside embedding (name/class/section/subject)
        db = get_db()
        cur = db.cursor()
        name = None
        class_name = None
        section = None
        subject = None

        if role == "student":
            cur.execute("SELECT name, class_name, section FROM students WHERE id = ?", (user_id,))
            r = cur.fetchone()
            if r:
                name = r[0]
                class_name = r[1]
                section = r[2]
        elif role == "teacher":
            cur.execute("SELECT name, subject FROM teachers WHERE id = ?", (user_id,))
            r = cur.fetchone()
            if r:
                name = r[0]
                subject = r[1]

        # Save embedding into unified face_embeddings table with metadata
        save_embedding(user_id, role, embedding, name=name, class_name=class_name, section=section, subject=subject)

        return jsonify({
            "status": "success",
            "message": f"{role.capitalize()} face enrolled successfully",
            "user_id": user_id
        }), 200

    except Exception as e:
        print("ERROR enroll_face:", e)
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500
