from flask import Blueprint, request, jsonify
import numpy as np
import json

from smart_school_backend.utils.db import get_db
from smart_school_backend.face_engine.encoder import generate_embedding
from smart_school_backend.models.face_recognition import store_face_embedding, load_all_embeddings

enrollment_bp = Blueprint("enrollment", __name__)

@enrollment_bp.route("/enroll", methods=["POST"])
def enroll_face():
    try:
        data = request.json

        image = data.get("image")
        user_id = data.get("user_id")
        role = data.get("role")

        if not image or not user_id or not role:
            return jsonify({"error": "Missing required fields"}), 400

        embedding = generate_embedding(image)
        if embedding is None:
            return jsonify({"error": "No face detected"}), 400

        # Check for existing faces
        existing_embeddings = load_all_embeddings()
        for existing in existing_embeddings:
            dist = np.linalg.norm(embedding - existing["embedding"])
            if dist < 0.6:
                return jsonify({
                    "error": "This face is already enrolled.",
                    "existing_user": {
                        "person_id": existing["person_id"],
                        "role": existing["role"],
                        "name": existing["name"]
                    }
                }), 409

        conn = get_db()
        cur = conn.cursor()

        user_data = None
        if role == 'student':
            cur.execute("SELECT name, email, class_name, section FROM students WHERE id = ?", (user_id,))
            user_data = cur.fetchone()
        elif role == 'teacher':
            cur.execute("SELECT name, email, subject FROM teachers WHERE id = ?", (user_id,))
            user_data = cur.fetchone()

        if not user_data:
            return jsonify({"error": f"User with id {user_id} and role {role} not found"}), 404

        name = user_data['name']
        email = user_data['email']
        
        if role == 'student':
            class_name = user_data['class_name']
            section = user_data['section']
        else:
            class_name = None
            section = None

        # Use the imported function to store the embedding
        store_face_embedding(role, user_id, name, email, class_name, section, embedding)

        print(f"Successfully enrolled face for person_id: {user_id}, role: {role}")
        return jsonify({
            "status": "success",
            "message": "Face enrolled successfully",
            "person_id": user_id,
            "role": role
        })

    except Exception as e:
        print("Enroll error:", e)
        return jsonify({"error": "Enrollment failed"}), 500
