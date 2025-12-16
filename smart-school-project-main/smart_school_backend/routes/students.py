from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import sqlite3
import os

bp = Blueprint("students", __name__, url_prefix="/api/students")

def get_db():
    db_path = os.path.join(os.path.dirname(__file__), "..", "database", "smart_school.db")
    db_path = os.path.abspath(db_path)
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================
# 1) GET ALL STUDENTS (FIX FOR STUDENTS PAGE)
# ============================================================
@bp.route("", methods=["GET"])
@jwt_required()
def get_students():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, class_name, section FROM students ORDER BY id DESC")
        rows = cur.fetchall()

        students = [dict(row) for row in rows]

        return jsonify({
            "students": students,
            "count": len(students)
        }), 200

    except Exception as e:
        print("ERROR GET_STUDENTS:", e)
        return jsonify({"error": "Failed to load students"}), 500


# ============================================================
# 2) GET STUDENT COUNT  (Dashboard)
# ============================================================
@bp.route("/count", methods=["GET"])
@jwt_required()
def get_student_count():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS total FROM students")
        row = cur.fetchone()
        return jsonify({"count": row["total"]}), 200
    except:
        return jsonify({"count": 0}), 200


# ============================================================
# 3) GET CLASS-WISE COUNT (Dashboard)
# ============================================================
@bp.route("/class-count", methods=["GET"])
@jwt_required()
def class_count():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT class_name, COUNT(*) AS count
            FROM students
            GROUP BY class_name
            ORDER BY class_name
        """)
        rows = cur.fetchall()
        data = [dict(r) for r in rows]
        return jsonify({"count": len(data), "data": data}), 200
    except:
        return jsonify({"count": 0, "data": []}), 200
