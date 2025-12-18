# smart_school_backend/routes/teachers.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import sqlite3
import os
from flask import current_app

bp = Blueprint("teachers", __name__)

# ----------------------------------------------------------
# DB helper
# ----------------------------------------------------------
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


# ----------------------------------------------------------
# GET /api/teachers
# ----------------------------------------------------------
@bp.route("", methods=["GET"])
@jwt_required()
def get_all_teachers():
    try:
        db = get_db()
        cur = db.cursor()

        cur.execute("SELECT id, name, email, id_code, subject FROM teachers ORDER BY id DESC")
        rows = cur.fetchall()

        teachers = []
        for r in rows:
            teachers.append({
                "id": r["id"],
                "name": r["name"],
                "email": r["email"],
                "subject": r["subject"]
            })

        return jsonify({"teachers": teachers}), 200

    except Exception as e:
        print("ERROR get_all_teachers:", e)
        return jsonify({"error": "Failed to fetch teachers"}), 500


# ----------------------------------------------------------
# GET /api/teachers/count
# ----------------------------------------------------------
@bp.route("/count", methods=["GET"])
@jwt_required()
def teacher_count():
    try:
        db = get_db()
        cur = db.cursor()

        cur.execute("SELECT COUNT(*) AS total FROM teachers")
        row = cur.fetchone()

        return jsonify({"count": row["total"]}), 200

    except Exception as e:
        print("ERROR teacher_count:", e)
        return jsonify({"count": 0}), 200


# ----------------------------------------------------------
# CREATE TEACHER
# POST /api/teachers
# ----------------------------------------------------------
@bp.route("", methods=["POST"])
@jwt_required()
def create_teacher():
    try:
        data = request.get_json() or {}
        id_code = data.get("id_code")
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")

        if not name or not email:
            return jsonify({"error": "name and email required"}), 400

        db = get_db()
        cur = db.cursor()
        if id_code:
            cur.execute("INSERT INTO teachers (name, email, id_code, subject) VALUES (?, ?, ?, ?)", (name, email, id_code, subject))
        else:
            cur.execute("INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)", (name, email, subject))
        db.commit()
        return jsonify({"message": "Teacher created", "id": cur.lastrowid}), 201
    except Exception as e:
        print("ERROR create_teacher:", e)
        return jsonify({"error": "Failed to create teacher"}), 500


# ----------------------------------------------------------
# GET /api/teachers/<id>
# ----------------------------------------------------------
@bp.route("/<int:teacher_id>", methods=["GET"])
@jwt_required()
def get_teacher(teacher_id):
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT id, name, email, id_code, subject FROM teachers WHERE id=?", (teacher_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"teacher": dict(row)}), 200
    except Exception as e:
        print("ERROR get_teacher:", e)
        return jsonify({"error": "Failed to load teacher"}), 500


# ----------------------------------------------------------
# UPDATE /api/teachers/<id>
# ----------------------------------------------------------
@bp.route("/<int:teacher_id>", methods=["PUT"])
@jwt_required()
def update_teacher(teacher_id):
    try:
        data = request.get_json() or {}
        id_code = data.get("id_code")
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")

        db = get_db()
        cur = db.cursor()
        if id_code is not None:
            cur.execute("UPDATE teachers SET name=?, email=?, id_code=?, subject=? WHERE id=?", (name, email, id_code, subject, teacher_id))
        else:
            cur.execute("UPDATE teachers SET name=?, email=?, subject=? WHERE id=?", (name, email, subject, teacher_id))
        db.commit()
        return jsonify({"message": "Teacher updated"}), 200
    except Exception as e:
        print("ERROR update_teacher:", e)
        return jsonify({"error": "Failed to update teacher"}), 500


# ----------------------------------------------------------
# DELETE /api/teachers/<id>
# ----------------------------------------------------------
@bp.route("/<int:teacher_id>", methods=["DELETE"])
@jwt_required()
def delete_teacher(teacher_id):
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("DELETE FROM teachers WHERE id=?", (teacher_id,))
        db.commit()
        return jsonify({"message": "Teacher deleted"}), 200
    except Exception as e:
        print("ERROR delete_teacher:", e)
        return jsonify({"error": "Failed to delete teacher"}), 500
