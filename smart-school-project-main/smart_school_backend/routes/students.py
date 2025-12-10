# smart_school_backend/routes/students.py

from flask import Blueprint, request, jsonify, current_app

try:
    # When package is installed / run as module
    from smart_school_backend.utils.db import get_db
except ImportError:
    # When running directly from project folder
    from utils.db import get_db

from flask_jwt_extended import jwt_required

bp = Blueprint("students", __name__)


# -------------------------------------------------------------------
# Helper
# -------------------------------------------------------------------
def row_to_student(row):
    # Adjust indices if your table is different
    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "class_name": row[3],
        "section": row[4],
        "roll_no": row[5] if len(row) > 5 else None,
    }


# -------------------------------------------------------------------
# Core CRUD (safe, simple)
# -------------------------------------------------------------------

@bp.route("/", methods=["GET"])
@jwt_required()
def list_students():
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, name, email, class_name, section, roll_no FROM students "
        "ORDER BY class_name, section, name"
    )
    rows = cur.fetchall()
    return jsonify({"students": [row_to_student(r) for r in rows]}), 200


@bp.route("/", methods=["POST"])
@jwt_required()
def create_student():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    class_name = data.get("class_name")
    section = data.get("section")
    roll_no = data.get("roll_no")

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute(
        """
        INSERT INTO students (name, email, class_name, section, roll_no)
        VALUES (?, ?, ?, ?, ?)
        """,
        (name, email, class_name, section, roll_no),
    )
    db.commit()
    student_id = cur.lastrowid

    return (
        jsonify(
            {
                "id": student_id,
                "name": name,
                "email": email,
                "class_name": class_name,
                "section": section,
                "roll_no": roll_no,
            }
        ),
        201,
    )


@bp.route("/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student(student_id):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, name, email, class_name, section, roll_no FROM students WHERE id=?",
        (student_id,),
    )
    row = cur.fetchone()
    if not row:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(row_to_student(row)), 200


@bp.route("/<int:student_id>", methods=["PUT"])
@jwt_required()
def update_student(student_id):
    data = request.get_json() or {}
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "SELECT id FROM students WHERE id=?",
        (student_id,),
    )
    if not cur.fetchone():
        return jsonify({"error": "Student not found"}), 404

    fields = []
    values = []
    for key in ("name", "email", "class_name", "section", "roll_no"):
        if key in data:
            fields.append(f"{key}=?")
            values.append(data[key])

    if fields:
        values.append(student_id)
        cur.execute(
            f"UPDATE students SET {', '.join(fields)} WHERE id=?",
            tuple(values),
        )
        db.commit()

    return jsonify({"message": "Student updated"}), 200


@bp.route("/<int:student_id>", methods=["DELETE"])
@jwt_required()
def delete_student(student_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM students WHERE id=?", (student_id,))
    db.commit()
    return jsonify({"message": "Student deleted"}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → STUDENT COUNT
# -------------------------------------------------------------------

@bp.route("/count", methods=["GET"])
@jwt_required()
def students_count():
    """
    Used by Admin Dashboard card "Students".
    GET /api/students/count  →  { "count": 0 }
    """
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute("SELECT COUNT(*) FROM students")
        count = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("students_count failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → CLASS COUNT
# -------------------------------------------------------------------

@bp.route("/class-count", methods=["GET"])
@jwt_required()
def class_count():
    """
    Get count of unique classes.
    GET /api/students/class-count  →  { "count": 5 }
    """
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute("SELECT COUNT(DISTINCT class_name) FROM students WHERE class_name IS NOT NULL")
        count = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("class_count failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200

