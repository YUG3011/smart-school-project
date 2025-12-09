# smart_school_backend/routes/timetable.py

from flask import Blueprint, request, jsonify
from utils.db import get_db
from flask_jwt_extended import jwt_required

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
