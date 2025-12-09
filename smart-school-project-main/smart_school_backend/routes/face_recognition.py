from flask import Blueprint, request, jsonify
import base64
import numpy as np

from models.face_recognition import (
    extract_face_embeddings,
    save_face_embedding,
    get_all_embeddings,
    recognize_face
)

face_recognition_bp = Blueprint("face_recognition", __name__)

# -------------------------------------------------------------
# Enroll a face (Admin or Teacher)
# -------------------------------------------------------------
@face_recognition_bp.route("/enroll", methods=["POST"])
def enroll_face():
    try:
        data = request.json
        person_id = data.get("person_id")
        name = data.get("name")
        email = data.get("email")
        role = data.get("role")
        image_base64 = data.get("image")

        if not all([person_id, name, email, role, image_base64]):
            return jsonify({"error": "Missing required fields"}), 400

        embedding = extract_face_embeddings(image_base64)
        if embedding is None:
            return jsonify({"error": "Face not detected"}), 400

        save_face_embedding(person_id, name, email, role, embedding)

        return jsonify({"message": "Face enrolled successfully"}), 200

    except Exception as e:
        print("Enroll face error:", e)
        return jsonify({"error": "Internal server error"}), 500


# -------------------------------------------------------------
# Recognize a face from camera input
# -------------------------------------------------------------
@face_recognition_bp.route("/recognize", methods=["POST"])
def recognize():
    try:
        data = request.json
        image_base64 = data.get("image")

        if not image_base64:
            return jsonify({"error": "Image is required"}), 400

        embedding = extract_face_embeddings(image_base64)
        if embedding is None:
            return jsonify({"error": "No face detected"}), 400

        stored = get_all_embeddings()

        match = recognize_face(embedding, stored)
        if match is None:
            return jsonify({"matched": False, "message": "Unknown face"}), 200

        return jsonify({
            "matched": True,
            "person_id": match["person_id"],
            "name": match["name"],
            "email": match["email"],
            "role": match["role"]
        }), 200

    except Exception as e:
        print("Recognize face error:", e)
        return jsonify({"error": "Internal server error"}), 500
