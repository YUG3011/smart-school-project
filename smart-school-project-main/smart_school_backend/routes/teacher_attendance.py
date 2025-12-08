from flask import Blueprint, request, jsonify
from datetime import datetime, date
from smart_school_backend.utils.db import get_db

bp = Blueprint("teacher_attendance", __name__, url_prefix="/api/teacher-attendance")


# --------------------------------------------
# 1. MARK TEACHER ATTENDANCE (ONCE PER DAY)
# --------------------------------------------
@bp.route("/mark", methods=["POST"])
def mark_attendance():
    data = request.json
    teacher_id = data.get("teacher_id")
    status = data.get("status", "Present")

    if not teacher_id:
        return jsonify({"error": "teacher_id is required"}), 400

    today = date.today().strftime("%Y-%m-%d")
    marked_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    db = get_db()
    cursor = db.cursor()

    # Check if teacher exists
    cursor.execute("SELECT id FROM teachers WHERE id = ?", (teacher_id,))
    teacher = cursor.fetchone()

    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404

    # Check if already marked for today
    cursor.execute("""
        SELECT id FROM teacher_attendance 
        WHERE teacher_id = ? AND date = ?
    """, (teacher_id, today))
    exists = cursor.fetchone()

    if exists:
        return jsonify({"error": "Attendance already marked today"}), 400

    # Insert attendance
    cursor.execute("""
        INSERT INTO teacher_attendance (teacher_id, date, status, marked_at)
        VALUES (?, ?, ?, ?)
    """, (teacher_id, today, status, marked_at))
    db.commit()

    return jsonify({
        "success": True,
        "message": "Attendance marked successfully",
        "data": {
            "teacher_id": teacher_id,
            "date": today,
            "status": status,
            "marked_at": marked_at
        }
    }), 201


# --------------------------------------------
# 2. GET TODAY'S ATTENDANCE FOR A TEACHER
# --------------------------------------------
@bp.route("/today/<int:teacher_id>", methods=["GET"])
def get_today_attendance(teacher_id):
    today = date.today().strftime("%Y-%m-%d")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT * FROM teacher_attendance 
        WHERE teacher_id = ? AND date = ?
    """, (teacher_id, today))

    record = cursor.fetchone()

    if not record:
        return jsonify({"message": "No attendance marked today"}), 404

    return jsonify({
        "success": True,
        "attendance": {
            "id": record["id"],
            "teacher_id": record["teacher_id"],
            "date": record["date"],
            "status": record["status"],
            "marked_at": record["marked_at"]
        }
    })


# --------------------------------------------
# 3. FULL ATTENDANCE HISTORY
# --------------------------------------------
@bp.route("/history/<int:teacher_id>", methods=["GET"])
def attendance_history(teacher_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT * FROM teacher_attendance 
        WHERE teacher_id = ? ORDER BY date DESC
    """, (teacher_id,))

    rows = cursor.fetchall()

    return jsonify({
        "success": True,
        "history": [
            {
                "id": r["id"],
                "date": r["date"],
                "status": r["status"],
                "marked_at": r["marked_at"]
            }
            for r in rows
        ]
    })
