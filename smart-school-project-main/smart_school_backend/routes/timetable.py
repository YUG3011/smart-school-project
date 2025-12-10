# smart_school_backend/routes/timetable.py

from flask import Blueprint, request, jsonify, current_app
from utils.db import get_db
from flask_jwt_extended import jwt_required
from datetime import datetime, date as date_module

bp = Blueprint("timetable", __name__)

# ------------------------------
# Get Timetable of a Class
# ------------------------------
@bp.route("/<class_name>/<section>", methods=["GET"])
@jwt_required()
def get_timetable(class_name, section):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id, class_name, section, subject, teacher_name, day, start_time, end_time "
        "FROM timetable WHERE class_name = ? AND section = ?",
        (class_name, section),
    )
    rows = cursor.fetchall()

    timetable = [
        {
            "id": r[0],
            "class_name": r[1],
            "section": r[2],
            "subject": r[3],
            "teacher_name": r[4],
            "day": r[5],
            "start_time": r[6],
            "end_time": r[7],
        }
        for r in rows
    ]

    return jsonify({"timetable": timetable}), 200


# ------------------------------
# Add Timetable Entry
# ------------------------------
@bp.route("/", methods=["POST"])
@jwt_required()
def add_timetable():
    data = request.json

    required = ["class_name", "section", "subject", "teacher_name", "day", "start_time", "end_time"]

    if not all(k in data and data[k] for k in required):
        return jsonify({"error": "All fields are required"}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO timetable (class_name, section, subject, teacher_name, day, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["class_name"],
            data["section"],
            data["subject"],
            data["teacher_name"],
            data["day"],
            data["start_time"],
            data["end_time"],
        ),
    )

    db.commit()
    return jsonify({"message": "Timetable entry added successfully"}), 201


# ------------------------------
# Delete a timetable entry
# ------------------------------
@bp.route("/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_timetable_entry(entry_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("DELETE FROM timetable WHERE id = ?", (entry_id,))
    db.commit()

    return jsonify({"message": "Timetable entry removed successfully"}), 200


# -------------------------------------------------------------------
# TEACHER DASHBOARD → TIMETABLE FOR TODAY
# -------------------------------------------------------------------
@bp.route("/teacher/<int:teacher_id>/today", methods=["GET"])
@jwt_required()
def teacher_timetable_today(teacher_id):
    """
    Get count of classes a teacher has today.
    GET /api/timetable/teacher/{id}/today

    Returns: { "count": 5 }
    """
    # Map day of week to name
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    today_name = days[date_module.today().weekday()]

    db = get_db()
    cursor = db.cursor()

    try:
        # Count classes for this teacher today
        cursor.execute(
            "SELECT COUNT(*) FROM timetable WHERE day = ?",
            (today_name,),
        )
        count = cursor.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("teacher_timetable_today failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200


# -------------------------------------------------------------------
# TEACHER DASHBOARD → TODAY'S ATTENDANCE (PLACEHOLDER)
# -------------------------------------------------------------------
@bp.route("/teacher/<int:teacher_id>/attendance/today", methods=["GET"])
@jwt_required()
def teacher_attendance_today(teacher_id):
    """
    Get count of students present from the teacher's classes today.
    GET /api/attendance/teacher/{id}/today

    Returns: { "present": 5 }
    """
    from datetime import date as date_module
    
    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'present'",
            (today,),
        )
        present = cursor.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("teacher_attendance_today failed: %s", e)
        present = 0

    return jsonify({"present": present}), 200

