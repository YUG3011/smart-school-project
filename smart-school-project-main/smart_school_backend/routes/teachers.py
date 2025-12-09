# smart_school_backend/routes/teachers.py

from flask import Blueprint, request, jsonify, current_app

try:
    from smart_school_backend.utils.db import get_db
except ImportError:
    from utils.db import get_db

from flask_jwt_extended import jwt_required

bp = Blueprint("teachers", __name__)


def row_to_teacher(row):
    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "subject": row[3] if len(row) > 3 else None,
    }


@bp.route("/", methods=["GET"])
@jwt_required()
def list_teachers():
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, name, email, subject FROM teachers ORDER BY name"
    )
    rows = cur.fetchall()
    return jsonify({"teachers": [row_to_teacher(r) for r in rows]}), 200


@bp.route("/", methods=["POST"])
@jwt_required()
def create_teacher():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)",
        (name, email, subject),
    )
    db.commit()
    teacher_id = cur.lastrowid

    return (
        jsonify(
            {
                "id": teacher_id,
                "name": name,
                "email": email,
                "subject": subject,
            }
        ),
        201,
    )


@bp.route("/<int:teacher_id>", methods=["GET"])
@jwt_required()
def get_teacher(teacher_id):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, name, email, subject FROM teachers WHERE id=?",
        (teacher_id,),
    )
    row = cur.fetchone()
    if not row:
        return jsonify({"error": "Teacher not found"}), 404
    return jsonify(row_to_teacher(row)), 200


@bp.route("/<int:teacher_id>", methods=["PUT"])
@jwt_required()
def update_teacher(teacher_id):
    data = request.get_json() or {}
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT id FROM teachers WHERE id=?", (teacher_id,))
    if not cur.fetchone():
        return jsonify({"error": "Teacher not found"}), 404

    fields, values = [], []
    for key in ("name", "email", "subject"):
        if key in data:
            fields.append(f"{key}=?")
            values.append(data[key])

    if fields:
        values.append(teacher_id)
        cur.execute(
            f"UPDATE teachers SET {', '.join(fields)} WHERE id=?",
            tuple(values),
        )
        db.commit()

    return jsonify({"message": "Teacher updated"}), 200


@bp.route("/<int:teacher_id>", methods=["DELETE"])
@jwt_required()
def delete_teacher(teacher_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM teachers WHERE id=?", (teacher_id,))
    db.commit()
    return jsonify({"message": "Teacher deleted"}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → TEACHER COUNT
# -------------------------------------------------------------------

@bp.route("/count", methods=["GET"])
@jwt_required()
def teachers_count():
    """
    Used by Admin Dashboard card "Teachers".
    GET /api/teachers/count  →  { "count": 0 }
    """
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute("SELECT COUNT(*) FROM teachers")
        count = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("teachers_count failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200
