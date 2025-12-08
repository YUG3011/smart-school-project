# smart_school_backend/routes/student_attendance.py

from flask import Blueprint, jsonify
from models.student_attendance import StudentAttendance
from models.student import Student
from utils.db import db

student_attendance_bp = Blueprint("student_attendance_bp", __name__, url_prefix="/api/student")


@student_attendance_bp.get("/attendance/<int:student_id>")
def get_student_attendance(student_id):
    records = (
        StudentAttendance.query
        .filter_by(student_id=student_id)
        .order_by(StudentAttendance.date.asc())
        .all()
    )

    output = []
    for r in records:
        output.append({
            "date": r.date.strftime("%Y-%m-%d"),
            "status": r.status,
            "timestamp": r.timestamp.strftime("%H:%M:%S"),
        })

    return jsonify({"attendance": output}), 200
