# smart_school_backend/routes/automatic_attendance.py

"""
Automatic Attendance Marking API
Uses face_recognition embeddings to auto-mark student/teacher attendance.

URLs (after app.py prefix):
- POST /api/auto-attendance/mark-student
- POST /api/auto-attendance/mark-teacher
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, date
from io import BytesIO
import base64
import json

import numpy as np
from PIL import Image
import face_recognition

# DB helper
try:
    from smart_school_backend.utils.db import get_db
except ImportError:
    from utils.db import get_db

bp = Blueprint("automatic_attendance", __name__)


# ---------------------------------------
# Shared Helpers
# ---------------------------------------

def decode_base64_image(image_data: str) -> np.ndarray:
    """Decode base64 (optional data URL) → RGB numpy array."""
    if not image_data:
        raise ValueError("No image data provided")

    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    image_bytes = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def extract_single_embedding(image_array: np.ndarray):
    """Return a single face embedding, or raise ValueError."""
    encodings = face_recognition.face_encodings(image_array)
    if len(encodings) == 0:
        raise ValueError("No face detected in image")
    if len(encodings) > 1:
        raise ValueError("Multiple faces detected. Please ensure only one person is in the frame")
    return encodings[0]


def check_already_marked(entity_id: int, entity_type: str) -> bool:
    """
    Check if attendance already marked today.
    - entity_type: 'student' or 'teacher'
    """
    conn = get_db()
    today = date.today().isoformat()

    if entity_type == "student":
        row = conn.execute(
            "SELECT id FROM student_attendance WHERE student_id = ? AND date = ? LIMIT 1",
            (entity_id, today),
        ).fetchone()
    else:
        row = conn.execute(
            "SELECT id FROM teacher_attendance WHERE teacher_id = ? AND date = ? LIMIT 1",
            (entity_id, today),
        ).fetchone()

    return row is not None


# ---------------------------------------
# Matching helpers
# ---------------------------------------

def _find_match_from_query(captured_embedding, rows, id_field_name: str, tolerance: float):
    """
    Generic matcher: captured_embedding (list/np) vs DB rows
    each row must contain: ['id', id_field_name, 'embedding', 'name', 'email']
    """
    if not rows:
        return None

    captured_np = np.array(captured_embedding)
    best_match = None
    best_confidence = 0.0

    for row in rows:
        stored_embedding = json.loads(row["embedding"])
        stored_np = np.array(stored_embedding)

        distance = face_recognition.face_distance([stored_np], captured_np)[0]
        confidence = 1.0 - float(distance)

        if distance <= tolerance and confidence > best_confidence:
            best_confidence = confidence
            best_match = {
                "embedding_id": row["id"],
                id_field_name: row[id_field_name],
                "name": row["name"],
                "email": row["email"],
                "distance": float(distance),
                "confidence": confidence,
            }

    return best_match


def find_matching_student(captured_embedding, tolerance=0.5):
    conn = get_db()
    rows = conn.execute(
        """
        SELECT fe.id, fe.student_id, fe.embedding, s.name, s.email
        FROM face_embeddings fe
        JOIN students s ON fe.student_id = s.id
        WHERE fe.is_active = 1
        """
    ).fetchall()

    return _find_match_from_query(captured_embedding, rows, "student_id", tolerance)


def find_matching_teacher(captured_embedding, tolerance=0.5):
    conn = get_db()
    rows = conn.execute(
        """
        SELECT fe.id, fe.teacher_id, fe.embedding, t.name, t.email
        FROM face_embeddings fe
        JOIN teachers t ON fe.teacher_id = t.id
        WHERE fe.is_active = 1
        """
    ).fetchall()

    return _find_match_from_query(captured_embedding, rows, "teacher_id", tolerance)


# ---------------------------------------
# Routes: Mark Student Attendance
# ---------------------------------------

@bp.route("/mark-student", methods=["POST"])
@jwt_required()
def mark_student_attendance():
    """
    Mark **student** attendance automatically from one photo.

    JSON:
    {
      "image": "base64",
      "tolerance": 0.5   // optional
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body"}), 400

        image_data = data.get("image")
        tolerance = float(data.get("tolerance", 0.5))

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        image_array = decode_base64_image(image_data)
        captured_embedding = extract_single_embedding(image_array)

        match = find_matching_student(captured_embedding.tolist(), tolerance)
        if not match:
            return jsonify({
                "success": False,
                "error": "Face not recognized. Please try again or check camera.",
            }), 200

        student_id = match["student_id"]
        if check_already_marked(student_id, "student"):
            return jsonify({
                "success": False,
                "already_marked": True,
                "student_id": student_id,
                "student_name": match["name"],
                "error": f"Attendance already marked today for {match['name']}",
            }), 200

        conn = get_db()
        today = date.today().isoformat()
        now_time = datetime.now().strftime("%H:%M:%S")

        try:
            conn.execute(
                """
                INSERT INTO student_attendance (student_id, date, status, marked_at)
                VALUES (?, ?, ?, ?)
                """,
                (student_id, today, "Present", now_time),
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"success": False, "error": f"Database error: {e}"}), 500

        return jsonify({
            "success": True,
            "message": f"Attendance marked for {match['name']}",
            "student_id": student_id,
            "student_name": match["name"],
            "status": "Present",
            "date": today,
            "time": now_time,
            "confidence": match["confidence"],
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        print("[AUTO_STUDENT_ERROR]", e)
        return jsonify({"success": False, "error": "Internal server error"}), 500


# ---------------------------------------
# Routes: Mark Teacher Attendance
# ---------------------------------------

@bp.route("/mark-teacher", methods=["POST"])
@jwt_required()
def mark_teacher_attendance():
    """
    Mark **teacher** attendance automatically from one photo.

    JSON:
    {
      "image": "base64",
      "tolerance": 0.5
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body"}), 400

        image_data = data.get("image")
        tolerance = float(data.get("tolerance", 0.5))

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        image_array = decode_base64_image(image_data)
        captured_embedding = extract_single_embedding(image_array)

        match = find_matching_teacher(captured_embedding.tolist(), tolerance)
        if not match:
            return jsonify({
                "success": False,
                "error": "Face not recognized. Please try again or check camera.",
            }), 200

        teacher_id = match["teacher_id"]
        if check_already_marked(teacher_id, "teacher"):
            return jsonify({
                "success": False,
                "already_marked": True,
                "teacher_id": teacher_id,
                "teacher_name": match["name"],
                "error": f"Attendance already marked today for {match['name']}",
            }), 200

        conn = get_db()
        today = date.today().isoformat()
        now_time = datetime.now().strftime("%H:%M:%S")

        try:
            conn.execute(
                """
                INSERT INTO teacher_attendance (teacher_id, date, status, marked_at)
                VALUES (?, ?, ?, ?)
                """,
                (teacher_id, today, "Present", now_time),
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"success": False, "error": f"Database error: {e}"}), 500

        return jsonify({
            "success": True,
            "message": f"Attendance marked for {match['name']}",
            "teacher_id": teacher_id,
            "teacher_name": match["name"],
            "status": "Present",
            "date": today,
            "time": now_time,
            "confidence": match["confidence"],
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        print("[AUTO_TEACHER_ERROR]", e)
        return jsonify({"success": False, "error": "Internal server error"}), 500
