from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import date, datetime
from smart_school_backend.utils.db import get_db

bp = Blueprint("teacher_attendance", __name__)

# Helper to convert cursor results to dict
def to_dict(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

# Mark attendance for a teacher
@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_attendance():
    data = request.json
    teacher_id = data.get("teacher_id")
    status = data.get("status")  # Present / Absent
    today_date = date.today().isoformat()
    now_time = datetime.now().isoformat()

    if not teacher_id or not status:
        return jsonify({"message": "Teacher ID and status are required"}), 400

    db = get_db()
    cursor = db.cursor()

    # Verify teacher exists
    cursor.execute("SELECT id FROM teachers WHERE id = ?", (teacher_id,))
    if cursor.fetchone() is None:
        return jsonify({"message": "Teacher not found"}), 404

    # Check if attendance already marked today
    cursor.execute(
        "SELECT id FROM teacher_attendance WHERE teacher_id = ? AND date = ?",
        (teacher_id, today_date)
    )
    if cursor.fetchone() is not None:
        return jsonify({"message": "Attendance already marked for today"}), 400

    # Create attendance record
    cursor.execute(
        "INSERT INTO teacher_attendance (teacher_id, date, status, marked_at) VALUES (?, ?, ?, ?)",
        (teacher_id, today_date, status, now_time)
    )
    new_attendance_id = cursor.lastrowid
    db.commit()
    
    # Retrieve the new record to return it
    cursor.execute("SELECT * FROM teacher_attendance WHERE id = ?", (new_attendance_id,))
    new_record = cursor.fetchone()

    return jsonify({
        "message": "Attendance marked successfully",
        "data": to_dict(cursor, new_record)
    }), 201


# Get today's teacher attendance
@bp.route("/today", methods=["GET"])
@jwt_required()
def today_attendance():
    today_date = date.today().isoformat()
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT ta.id, ta.teacher_id, t.name as teacher_name, ta.date, ta.status 
        FROM teacher_attendance ta
        JOIN teachers t ON ta.teacher_id = t.id
        WHERE ta.date = ?
    """, (today_date,))
    
    records = [to_dict(cursor, row) for row in cursor.fetchall()]
    return jsonify(records), 200


# Get all attendance for one teacher
@bp.route("/teacher/<int:teacher_id>", methods=["GET"])
@jwt_required()
def teacher_history(teacher_id):
    db = get_db()
    cursor = db.cursor()

    # Verify teacher exists
    cursor.execute("SELECT id FROM teachers WHERE id = ?", (teacher_id,))
    if cursor.fetchone() is None:
        return jsonify({"message": "Teacher not found"}), 404

    cursor.execute("""
        SELECT ta.id, ta.teacher_id, t.name as teacher_name, ta.date, ta.status 
        FROM teacher_attendance ta
        JOIN teachers t ON ta.teacher_id = t.id
        WHERE ta.teacher_id = ?
        ORDER BY ta.date DESC
    """, (teacher_id,))

    records = [to_dict(cursor, row) for row in cursor.fetchall()]
    return jsonify(records), 200
