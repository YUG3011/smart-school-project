import numpy as np
from flask import Blueprint, request, jsonify
from smart_school_backend.face_engine.encoder import encode_image_base64
from smart_school_backend.face_engine.encoder import compare_embeddings
from smart_school_backend.utils.db import get_db

recognition_bp = Blueprint("recognition_bp", __name__)

# Recommended threshold for 128-d face_recognition embeddings
MATCH_THRESHOLD = 0.48


# =====================================================================
# UNIFIED RECOGNITION API
# =====================================================================
@recognition_bp.route("/recognize", methods=["POST"])
def recognize_face():
    data = request.get_json() or {}

    image_b64 = data.get("image_base64")
    if not image_b64:
        return jsonify({"error": "No image provided"}), 400

    # --------------------------------------------------------------
    # 1. Extract face embeddings from the frame
    # --------------------------------------------------------------
    embeddings = encode_image_base64(image_b64)

    if len(embeddings) == 0:
        return jsonify({"match": False, "message": "No face detected"}), 200

    frame_emb = np.array(embeddings[0], dtype=np.float32)

    # --------------------------------------------------------------
    # 2. Load stored embeddings from DB
    # --------------------------------------------------------------
    db = get_db()
    cur = db.cursor()

    rows = cur.execute(
        "SELECT id, person_id, role, name, class_name, section, subject, embedding FROM face_embeddings"
    ).fetchall()

    if not rows:
        return jsonify({"match": False, "message": "No enrolled faces"}), 200

    best_match = None
    best_distance = 999

    # --------------------------------------------------------------
    # 3. Compare frame embedding with DB embeddings
    # --------------------------------------------------------------
    for r in rows:
        emb_bytes = r["embedding"]
        db_emb = np.frombuffer(emb_bytes, dtype=np.float32)

        distance = compare_embeddings(frame_emb, db_emb)

        if distance < best_distance:
            best_distance = distance
            best_match = r

    # --------------------------------------------------------------
    # 4. Threshold check — Is it a real match?
    # --------------------------------------------------------------
    if best_distance > MATCH_THRESHOLD:
        return jsonify({
            "match": False,
            "distance": float(best_distance),
            "message": "Face not recognized"
        }), 200

    # --------------------------------------------------------------
    # 5. Build response with student/teacher details
    # --------------------------------------------------------------
    response = {
        "match": True,
        "distance": float(best_distance),
        "person_id": best_match["person_id"],
        "role": best_match["role"],
        "name": best_match["name"],
        "class_name": best_match["class_name"],
        "section": best_match["section"],
        "subject": best_match["subject"],
    }

    return jsonify(response), 200
