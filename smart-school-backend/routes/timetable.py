# routes/timetable.py

from flask import Blueprint, request, jsonify
from utils.db import get_db
from flask_jwt_extended import jwt_required

bp = Blueprint("timetable", __name__, url_prefix="/timetable")

# -------------------------
# GET ALL TIMETABLE ENTRIES
# -------------------------
@bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    conn = get_db()
    rows = conn.execute("SELECT * FROM timetable").fetchall()

    data = [
        {
            "id": row["id"],
            "class_name": row["class_name"],
            "subject": row["subject"],
            "teacher": row["teacher"],
            "day": row["day"],
            "time": row["time"]
        }
        for row in rows
    ]

    return jsonify(data), 200


# -------------------------
# ADD TIMETABLE ENTRY
# -------------------------
@bp.route("/", methods=["POST"])
@jwt_required()
def add():
    data = request.json

    class_name = data.get("class_name")
    subject = data.get("subject")
    teacher = data.get("teacher")
    day = data.get("day")
    time = data.get("time")

    if not all([class_name, subject, teacher, day, time]):
        return jsonify({"error": "All fields required"}), 400

    conn = get_db()
    conn.execute(
        """
        INSERT INTO timetable (class_name, subject, teacher, day, time)
        VALUES (?, ?, ?, ?, ?)
        """,
        (class_name, subject, teacher, day, time),
    )
    conn.commit()

    return jsonify({"message": "Timetable entry added"}), 201


# -------------------------
# UPDATE TIMETABLE ENTRY
# -------------------------
@bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    data = request.json

    conn = get_db()
    entry = conn.execute(
        "SELECT id FROM timetable WHERE id=?", (id,)
    ).fetchone()

    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    conn.execute(
        """
        UPDATE timetable
        SET class_name=?, subject=?, teacher=?, day=?, time=?
        WHERE id=?
        """,
        (
            data.get("class_name"),
            data.get("subject"),
            data.get("teacher"),
            data.get("day"),
            data.get("time"),
            id,
        ),
    )
    conn.commit()

    return jsonify({"message": "Timetable updated"}), 200


# -------------------------
# DELETE TIMETABLE ENTRY
# -------------------------
@bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    conn = get_db()
    entry = conn.execute(
        "SELECT id FROM timetable WHERE id=?", (id,)
    ).fetchone()

    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    conn.execute("DELETE FROM timetable WHERE id=?", (id,))
    conn.commit()

    return jsonify({"message": "Timetable deleted"}), 200
