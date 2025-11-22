# routes/attendance.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from utils.db import get_db
from datetime import datetime

bp = Blueprint("attendance", __name__)

@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_attendance():
    data = request.json
    student_id = data["student_id"]
    status = data.get("status", "Present")

    now = datetime.now()
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")

    conn = get_db()
    conn.execute(
        "INSERT INTO attendance (student_id, date, time, status) VALUES (?, ?, ?, ?)",
        (student_id, date, time, status)
    )
    conn.commit()

    return jsonify({"message": "Attendance Marked"}), 200


@bp.route("/", methods=["GET"])
@jwt_required()
def get_attendance():
    date = request.args.get("date")
    conn = get_db()
    rows = conn.execute("SELECT * FROM attendance WHERE date=?", (date,)).fetchall()
    return jsonify([dict(row) for row in rows])
