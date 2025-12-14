# smart_school_backend/routes/face_recognition.py

import sqlite3
import io
import base64
import pickle
import numpy as np
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from PIL import Image
import face_recognition
import os
from datetime import datetime

# Blueprint
face_recognition_bp = Blueprint("face_recognition", __name__)

# --------------------------------------------------
# DB helper
# --------------------------------------------------
def get_db():
    try:
        from smart_school_backend.utils.db import get_db as gdb
        return gdb()
    except Exception:
        db_path = os.path.join(current_app.root_path, "..", "database", "smart_school.db")
        db_path = os.path.abspath(db_path)
        conn = sqlite3.connect(db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

# --------------------------------------------------
# Decode base64 → PIL Image
# --------------------------------------------------
def decode_image(image_b64):
    try:
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]
        img_bytes = base64.b64decode(image_b64)
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except:
        return None

# --------------------------------------------------
# Compute embedding using face_recognition
# --------------------------------------------------
def compute_embedding(pil_image):
    np_img = np.array(pil_image)
    encodings = face_recognition.face_encodings(np_img)
    return encodings[0].astype(np.float32) if encodings else None

# --------------------------------------------------
# Serialization helpers
# --------------------------------------------------
def serialize_embedding(embedding):
    return pickle.dumps(embedding, protocol=pickle.HIGHEST_PROTOCOL)

def deserialize_embedding(blob):
    return pickle.loads(blob)

# =====================================================================
# 1. ENROLL STUDENT — ALSO CREATE student RECORD
# =====================================================================
@face_recognition_bp.route("/enroll/student", methods=["POST"])
@jwt_required()
def enroll_student():
    try:
        data = request.get_json()
        face_id = data.get("id")
        name = data.get("name")
        email = data.get("email")
        class_name = data.get("class_name")
        section = data.get("section")
        image_b64 = data.get("image_base64")

        if not face_id or not image_b64:
            return jsonify({"error": "Missing student ID or image"}), 400

        img = decode_image(image_b64)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        embedding = compute_embedding(img)
        if embedding is None:
            return jsonify({"error": "No face detected"}), 400

        blob = serialize_embedding(embedding)

        db = get_db()
        cur = db.cursor()

        # Save embedding
        cur.execute("""
            INSERT INTO face_embeddings (role, face_id, name, email, class_name, section, created_at, embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(face_id) DO UPDATE SET
                name=excluded.name,
                email=excluded.email,
                class_name=excluded.class_name,
                section=excluded.section,
                created_at=excluded.created_at,
                embedding=excluded.embedding
        """, (
            "student",
            face_id,
            name,
            email,
            class_name,
            section,
            datetime.utcnow().isoformat(),
            sqlite3.Binary(blob)
        ))

        # ALSO create/update student record
        cur.execute("SELECT id FROM students WHERE email=?", (email,))
        row = cur.fetchone()

        if row:
            student_id = row["id"]
        else:
            cur.execute("""
                INSERT INTO students (name, email, class_name, section)
                VALUES (?, ?, ?, ?)
            """, (name, email, class_name, section))
            student_id = cur.lastrowid

        db.commit()

        return jsonify({
            "message": "Student face enrolled",
            "face_id": face_id,
            "student_id": student_id
        }), 200

    except Exception as e:
        print("ERROR enroll_student:", e)
        return jsonify({"error": "Enrollment failed"}), 500


# =====================================================================
# 2. ENROLL TEACHER — ALSO CREATE teacher RECORD
# =====================================================================
@face_recognition_bp.route("/enroll/teacher", methods=["POST"])
@jwt_required()
def enroll_teacher():
    try:
        data = request.get_json()
        face_id = data.get("id")
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")
        image_b64 = data.get("image_base64")

        if not face_id or not image_b64:
            return jsonify({"error": "Missing teacher ID or image"}), 400

        img = decode_image(image_b64)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        embedding = compute_embedding(img)
        if embedding is None:
            return jsonify({"error": "No face detected"}), 400

        blob = serialize_embedding(embedding)

        db = get_db()
        cur = db.cursor()

        # Save embedding
        cur.execute("""
            INSERT INTO face_embeddings (role, face_id, name, email, class_name, section, created_at, embedding)
            VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)
            ON CONFLICT(face_id) DO UPDATE SET
                name=excluded.name,
                email=excluded.email,
                embedding=excluded.embedding,
                created_at=excluded.created_at
        """, (
            "teacher",
            face_id,
            name,
            email,
            datetime.utcnow().isoformat(),
            sqlite3.Binary(blob)
        ))

        # ALSO create/update teacher record
        cur.execute("SELECT id FROM teachers WHERE email=?", (email,))
        row = cur.fetchone()

        if row:
            teacher_id = row["id"]
        else:
            cur.execute("""
                INSERT INTO teachers (name, email, subject)
                VALUES (?, ?, ?)
            """, (name, email, subject))
            teacher_id = cur.lastrowid

        db.commit()

        return jsonify({
            "message": "Teacher face enrolled",
            "face_id": face_id,
            "teacher_id": teacher_id
        }), 200

    except Exception as e:
        print("ERROR enroll_teacher:", e)
        return jsonify({"error": "Enrollment failed"}), 500


# =====================================================================
# 3. RECOGNIZE FACE — AUTO-MARK ATTENDANCE
# =====================================================================
@face_recognition_bp.route("/recognize", methods=["POST"])
@jwt_required()
def recognize():
    try:
        data = request.get_json()
        image_b64 = data.get("image_base64")

        if not image_b64:
            return jsonify({"error": "Missing image"}), 400

        img = decode_image(image_b64)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        embedding = compute_embedding(img)
        if embedding is None:
            return jsonify({"match": False, "message": "No face detected"}), 200

        db = get_db()
        cur = db.cursor()

        cur.execute("SELECT role, face_id, name, email, class_name, section, embedding FROM face_embeddings")
        rows = cur.fetchall()

        best_match = None
        best_dist = 999
        for r in rows:
            stored_emb = deserialize_embedding(r["embedding"])
            dist = np.linalg.norm(stored_emb - embedding)
            if dist < best_dist:
                best_dist = dist
                best_match = r

        threshold = 0.45

        if not best_match or best_dist > threshold:
            return jsonify({"match": False, "distance": float(best_dist)}), 200

        # -----------------------------------------
        # AUTO-MARK ATTENDANCE
        # -----------------------------------------
        role = best_match["role"]
        email = best_match["email"]

        if role == "student":
            cur.execute("SELECT id, class_name FROM students WHERE email=?", (email,))
            stu = cur.fetchone()
            if stu:
                student_id = stu["id"]
                class_name = stu["class_name"]

                cur.execute("""
                    INSERT OR IGNORE INTO student_attendance
                    (student_id, class_name, date, status)
                    VALUES (?, ?, date('now'), 'present')
                """, (student_id, class_name))
                db.commit()

        elif role == "teacher":
            cur.execute("SELECT id FROM teachers WHERE email=?", (email,))
            t = cur.fetchone()
            if t:
                teacher_id = t["id"]

                cur.execute("""
                    INSERT OR IGNORE INTO teacher_attendance
                    (teacher_id, date, status)
                    VALUES (?, date('now'), 'present')
                """, (teacher_id,))
                db.commit()

        return jsonify({
            "match": True,
            "face_id": best_match["face_id"],
            "name": best_match["name"],
            "role": best_match["role"],
            "distance": float(best_dist)
        }), 200

    except Exception as e:
        print("ERROR recognize:", e)
        return jsonify({"error": "Recognition failed"}), 500
