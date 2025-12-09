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
