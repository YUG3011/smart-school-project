import sqlite3
from flask import Blueprint, request, jsonify, current_app, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from smart_school_backend.utils.db import get_db
from datetime import datetime, date as date_module

bp = Blueprint("teacher_attendance", __name__)

def setup_teacher_attendance_table():
    if 'teacher_attendance_table_checked' not in g:
        db = get_db()
        cur = db.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS teacher_attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL,
                marked_at TEXT,
                UNIQUE(teacher_id, date)
            )
        """)
        db.commit()
        g.teacher_attendance_table_checked = True

@bp.before_request
def before_request_handler():
    setup_teacher_attendance_table()

@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_teacher_attendance():
    """
    Marks teacher attendance for today. It's idempotent, so it won't
    create duplicate entries for the same teacher on the same day.
    """
    data = request.get_json() or {}
    teacher_id = data.get("teacher_id")

    if not teacher_id:
        return jsonify({"error": "teacher_id is required"}), 400

    today = date_module.today().isoformat()
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            """
            INSERT INTO teacher_attendance (teacher_id, date, status, marked_at)
            VALUES (?, ?, 'present', ?)
            ON CONFLICT(teacher_id, date) DO NOTHING
            """,
            (teacher_id, today, datetime.now().isoformat()),
        )
        db.commit()
        
        if cur.rowcount > 0:
            return jsonify({"message": "Attendance marked successfully"}), 201
        else:
            return jsonify({"message": "Attendance already marked for today"}), 200

    except sqlite3.IntegrityError:
        # This is a fallback in case the UNIQUE constraint is violated
        # in a way that ON CONFLICT doesn't catch (unlikely).
        return jsonify({"message": "Attendance already marked for today"}), 200
    except Exception as e:
        current_app.logger.error("Failed to mark teacher attendance: %s", e)
        return jsonify({"error": "Server error while marking attendance"}), 500


@bp.route("/records", methods=["GET"])
@jwt_required()
def get_teacher_attendance_records():
    identity = get_jwt_identity()
    teacher_id = identity["id"]

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT date, marked_at, status
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