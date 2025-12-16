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

        cur.execute("SELECT id, name, email, subject FROM teachers ORDER BY id DESC")
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
