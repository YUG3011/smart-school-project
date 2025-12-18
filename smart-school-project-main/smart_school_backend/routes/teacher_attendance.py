# smart_school_backend/routes/teacher_attendance.py

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from utils.db import get_db
from datetime import datetime, date as date_module

bp = Blueprint("teacher_attendance_bp", __name__)

# Create table if missing
def create_teacher_attendance_table():
    db = get_db()
    cur = db.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS teacher_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)

    db.commit()


@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_teacher_attendance():
    # `create_access_token` stores identity as the user id (string) and puts
    # role/email into additional claims. Read claims via `get_jwt()`.
    identity = get_jwt_identity()
    claims = get_jwt()

    role = claims.get("role") if isinstance(claims, dict) else None
    if role != "teacher":
        return jsonify({"error": "Only teachers can mark attendance"}), 403

    try:
        teacher_id = int(identity)
    except Exception:
        teacher_id = identity
    today = datetime.now().strftime("%Y-%m-%d")

    db = get_db()
    cur = db.cursor()

    # Check if attendance already exists
    cur.execute(
        "SELECT id FROM teacher_attendance WHERE teacher_id=? AND date=?",
        (teacher_id, today),
    )
    exists = cur.fetchone()

    if exists:
        return jsonify({"message": "Attendance already marked for today"}), 400

    cur.execute("""
        INSERT INTO teacher_attendance (teacher_id, date, time, status)
        VALUES (?, ?, ?, ?)
    """, (
        teacher_id,
        today,
        datetime.now().strftime("%H:%M:%S"),
        "Present"
    ))

    db.commit()

    return jsonify({"message": "Attendance marked successfully"}), 200


@bp.route("/records", methods=["GET"])
@jwt_required()
def get_teacher_attendance_records():
    identity = get_jwt_identity()
    teacher_id = identity["id"]

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT date, time, status
        FROM teacher_attendance
        WHERE teacher_id=?
        ORDER BY date DESC
    """, (teacher_id,))

    rows = cur.fetchall()

    records = [dict(row) for row in rows]

    return jsonify(records), 200


# -------------------------------------------------------------------
# TEACHER DASHBOARD → TODAY'S ATTENDANCE COUNT
# -------------------------------------------------------------------
@bp.route("/<int:teacher_id>/today", methods=["GET"])
@jwt_required()
def teacher_attendance_count_today(teacher_id):
    """
    Get count of students marked present today (from student_attendance table).
    GET /api/attendance/teacher/{id}/today

    Returns: { "present": 5 }
    """
    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'present'",
            (today,),
        )
        present = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("teacher_attendance_count_today failed: %s", e)
        present = 0

    return jsonify({"present": present}), 200

