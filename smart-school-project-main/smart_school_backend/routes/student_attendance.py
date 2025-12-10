# smart_school_backend/routes/student_attendance.py

from flask import Blueprint, request, jsonify, current_app

try:
    from smart_school_backend.utils.db import get_db
except ImportError:
    from utils.db import get_db

from flask_jwt_extended import jwt_required

# Correct blueprint name
student_attendance_bp = Blueprint("student_attendance", __name__)


# -------------------------------------------------------------------
# RECORD ATTENDANCE FOR A STUDENT
# -------------------------------------------------------------------
@student_attendance_bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_student_attendance():
    """
    Example request:
    POST /api/student-attendance/mark

    {
        "student_id": 1,
        "date": "2025-12-09",
        "status": "present"
    }
    """
    data = request.get_json() or {}

    student_id = data.get("student_id")
    date = data.get("date")
    status = data.get("status", "present")

    if not student_id or not date:
        return jsonify({"error": "student_id and date required"}), 400

    db = get_db()
    cur = db.cursor()

    try:
        # Insert or update attendance
        cur.execute(
            """
            INSERT INTO student_attendance (student_id, date, status)
            VALUES (?, ?, ?)
            ON CONFLICT(student_id, date)
            DO UPDATE SET status=excluded.status
            """,
            (student_id, date, status),
        )
        db.commit()

    except Exception as e:
        current_app.logger.error("mark_student_attendance error: %s", e)
        return jsonify({"error": "Failed to save attendance"}), 500

    return jsonify({"message": "Attendance saved"}), 200


# -------------------------------------------------------------------
# GET ALL ATTENDANCE FOR A SPECIFIC STUDENT
# -------------------------------------------------------------------
@student_attendance_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student_attendance(student_id):
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            """
            SELECT date, status
            FROM student_attendance
            WHERE student_id=?
            ORDER BY date DESC
            """,
            (student_id,),
        )
        rows = cur.fetchall()
    except Exception as e:
        current_app.logger.error("get_student_attendance error: %s", e)
        return jsonify({"attendance": []}), 200

    attendance_list = [
        {"date": row[0], "status": row[1]} for row in rows
    ]

    return jsonify({"attendance": attendance_list}), 200


# -------------------------------------------------------------------
# STUDENT DASHBOARD → ATTENDANCE STATISTICS
# -------------------------------------------------------------------
@student_attendance_bp.route("/<int:student_id>/stats", methods=["GET"])
@jwt_required()
def student_stats(student_id):
    """
    Get overall attendance stats for a student.
    GET /api/student-attendance/{id}/stats

    Returns:
    {
        "total_days": 20,
        "present_days": 18,
        "percentage": 90
    }
    """
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE student_id=?",
            (student_id,),
        )
        total_days = cur.fetchone()[0] or 0

        cur.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE student_id=? AND status='present'",
            (student_id,),
        )
        present_days = cur.fetchone()[0] or 0

        percentage = round((present_days / total_days * 100)) if total_days > 0 else 0

    except Exception as e:
        current_app.logger.warning("student_stats failed: %s", e)
        total_days = 0
        present_days = 0
        percentage = 0

    return jsonify({
        "total_days": total_days,
        "present_days": present_days,
        "percentage": percentage
    }), 200


# -------------------------------------------------------------------
# STUDENT DASHBOARD → TODAY'S STATUS
# -------------------------------------------------------------------
@student_attendance_bp.route("/<int:student_id>/today", methods=["GET"])
@jwt_required()
def student_today(student_id):
    """
    Get student's attendance status for today.
    GET /api/student-attendance/{id}/today

    Returns: { "status": "present" | "absent" | "Not Marked" }
    """
    from datetime import date as date_module
    
    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT status FROM student_attendance WHERE student_id=? AND date=?",
            (student_id, today),
        )
        row = cur.fetchone()
        status = row[0] if row else "Not Marked"
    except Exception as e:
        current_app.logger.warning("student_today failed: %s", e)
        status = "Not Marked"

    return jsonify({"status": status}), 200


# -------------------------------------------------------------------
# STUDENT DASHBOARD → RECENT ATTENDANCE LOGS
# -------------------------------------------------------------------
@student_attendance_bp.route("/<int:student_id>/logs", methods=["GET"])
@jwt_required()
def student_logs(student_id):
    """
    Get recent attendance logs for a student.
    GET /api/student-attendance/{id}/logs?limit=5

    Returns: { "data": [{"date": "...", "status": "..."}, ...] }
    """
    limit = request.args.get("limit", default=5, type=int)
    db = get_db()
    cur = db.cursor()

    logs = []

    try:
        cur.execute(
            """
            SELECT date, status
            FROM student_attendance
            WHERE student_id=?
            ORDER BY date DESC
            LIMIT ?
            """,
            (student_id, limit),
        )
        rows = cur.fetchall()

        for row in rows:
            logs.append({"date": row[0], "status": row[1]})

    except Exception as e:
        current_app.logger.warning("student_logs failed: %s", e)
        logs = []

    return jsonify({"data": logs}), 200


# -------------------------------------------------------------------
# STUDENT ATTENDANCE VIEW → OVERALL STATISTICS
# -------------------------------------------------------------------
@student_attendance_bp.route("/stats/overview", methods=["GET"])
@jwt_required()
def student_attendance_overview():
    """
    Get overall attendance statistics (used by StudentAttendanceView page).
    GET /api/student-attendance/stats/overview

    Returns summary stats for all students.
    """
    db = get_db()
    cur = db.cursor()

    try:
        # Total attendance records
        cur.execute("SELECT COUNT(*) FROM student_attendance")
        total_records = cur.fetchone()[0] or 0

        # Present records
        cur.execute("SELECT COUNT(*) FROM student_attendance WHERE status='present'")
        present_count = cur.fetchone()[0] or 0

        # Absent records
        cur.execute("SELECT COUNT(*) FROM student_attendance WHERE status='absent'")
        absent_count = cur.fetchone()[0] or 0

        percentage = round((present_count / total_records * 100)) if total_records > 0 else 0

    except Exception as e:
        current_app.logger.warning("student_attendance_overview failed: %s", e)
        total_records = 0
        present_count = 0
        absent_count = 0
        percentage = 0

    return jsonify({
        "total_records": total_records,
        "present": present_count,
        "absent": absent_count,
        "percentage": percentage
    }), 200

