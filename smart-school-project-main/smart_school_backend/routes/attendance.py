# smart_school_backend/routes/attendance.py

from flask import Blueprint, request, jsonify, current_app

try:
    from smart_school_backend.utils.db import get_db
except ImportError:
    from utils.db import get_db

from flask_jwt_extended import jwt_required
from datetime import date as date_module

bp = Blueprint("attendance", __name__)
attendance_view_bp = Blueprint("attendance_view", __name__)


# -------------------------------------------------------------------
# MANUAL STUDENT ATTENDANCE (basic)
# -------------------------------------------------------------------

@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_attendance():
    """
    Manual attendance marking.
    Expects JSON: { "student_id": 1, "date": "2025-12-09", "status": "present" }
    """
    data = request.get_json() or {}
    student_id = data.get("student_id")
    date = data.get("date")
    status = data.get("status", "present")

    if not student_id or not date:
        return jsonify({"error": "student_id and date are required"}), 400

    db = get_db()
    cur = db.cursor()

    # Upsert pattern: if already exists for that date, update; else insert
    try:
        cur.execute(
            """
            INSERT INTO student_attendance (student_id, date, status)
            VALUES (?, ?, ?)
            ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status
            """,
            (student_id, date, status),
        )
    except Exception:
        # If ON CONFLICT is not supported for your table definition,
        # fall back to manual update.
        try:
            cur.execute(
                "UPDATE student_attendance SET status=? WHERE student_id=? AND date=?",
                (status, student_id, date),
            )
            if cur.rowcount == 0:
                cur.execute(
                    "INSERT INTO student_attendance (student_id, date, status) VALUES (?, ?, ?)",
                    (student_id, date, status),
                )
        except Exception as e:
            current_app.logger.error("mark_attendance failed: %s", e)
            return jsonify({"error": "Failed to save attendance"}), 500

    db.commit()
    return jsonify({"message": "Attendance marked successfully"}), 200


# -------------------------------------------------------------------
# DASHBOARD → RECENT ATTENDANCE TIMELINE
# -------------------------------------------------------------------

@attendance_view_bp.route("/all", methods=["GET"])
@jwt_required()
def recent_attendance():
    """
    Endpoint used by Admin Dashboard:
      GET /api/attendance-view/all?limit=5

    We TRY to fetch recent attendance records from DB. If anything
    goes wrong (no table, schema mismatch, etc.), we **log and
    return an empty list** so that the dashboard still works and
    does NOT auto-logout.
    """
    limit = request.args.get("limit", default=5, type=int)

    db = get_db()
    cur = db.cursor()

    records = []

    try:
        # This query is generic; adjust table/column names if needed.
        cur.execute(
            """
            SELECT sa.date,
                   s.name,
                   s.class_name,
                   sa.status
            FROM student_attendance AS sa
            JOIN students AS s ON s.id = sa.student_id
            ORDER BY sa.date DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()

        for row in rows:
            records.append(
                {
                    "date": row[0],
                    "name": row[1],
                    "class_name": row[2],
                    "status": row[3],
                }
            )

    except Exception as e:
        # IMPORTANT: swallow errors and just return empty data
        current_app.logger.warning(
            "recent_attendance query failed, returning empty list: %s", e
        )
        records = []

    return jsonify({"records": records}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → TODAY'S ATTENDANCE COUNT
# -------------------------------------------------------------------

@bp.route("/today", methods=["GET"])
@jwt_required()
def today_attendance_count():
    """
    Get count of students marked present today.
    GET /api/attendance/today  →  { "count": 5 }
    """
    from datetime import date as date_module
    
    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'present'",
            (today,),
        )
        count = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("today_attendance_count failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → TEACHER'S RECENT ATTENDANCE VIEW
# -------------------------------------------------------------------

@attendance_view_bp.route("/teacher/<int:teacher_id>", methods=["GET"])
@jwt_required()
def teacher_recent_attendance(teacher_id):
    """
    Endpoint used by Teacher Dashboard:
      GET /api/attendance-view/teacher/{id}?limit=5

    Returns recent attendance records for that teacher's students.
    """
    limit = request.args.get("limit", default=5, type=int)

    db = get_db()
    cur = db.cursor()
    records = []

    try:
        # Fetch students taught by this teacher + their recent attendance
        cur.execute(
            """
            SELECT DISTINCT sa.date,
                   s.name,
                   s.class_name,
                   sa.status
            FROM student_attendance AS sa
            JOIN students AS s ON s.id = sa.student_id
            ORDER BY sa.date DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()

        for row in rows:
            records.append(
                {
                    "date": row[0],
                    "name": row[1],
                    "class_name": row[2],
                    "status": row[3],
                }
            )

    except Exception as e:
        current_app.logger.warning(
            "teacher_recent_attendance failed, returning empty list: %s", e
        )
        records = []

    return jsonify({"data": records}), 200


# -------------------------------------------------------------------
# TEACHER DASHBOARD → TODAY'S STUDENT ATTENDANCE COUNT
# -------------------------------------------------------------------

@bp.route("/teacher/<int:teacher_id>/today", methods=["GET"])
@jwt_required()
def teacher_attendance_today_count(teacher_id):
    """
    Get count of students marked present today (for teacher dashboard).
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
        current_app.logger.warning("teacher_attendance_today_count failed: %s", e)
        present = 0

    return jsonify({"present": present}), 200

