# routes/attendance_view.py

from flask import Blueprint, jsonify, request
from utils.db import get_db
from flask import Blueprint, request, jsonify
from utils.db import get_db


attendance_view_bp = Blueprint("attendance_view", __name__)

@attendance_view_bp.route("/all", methods=["GET"])
def get_all_attendance():
    db = get_db()
    role = request.args.get("role")  # "student" or "teacher" or None
    date = request.args.get("date")

    base_query = """
        SELECT id, name, role, date, time
        FROM attendance_records
        WHERE 1=1
    """

    params = []

    if role:
        base_query += " AND role = ?"
        params.append(role)

    if date:
        base_query += " AND date = ?"
        params.append(date)

    rows = db.execute(base_query, params).fetchall()

    data = [dict(row) for row in rows]

    return jsonify({"records": data}), 200
