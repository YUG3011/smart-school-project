from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from smart_school_backend.utils.db import get_db

bp = Blueprint("students", __name__)

# ==============================
# ADD STUDENT
# ==============================
@bp.route("/", methods=["POST"])
@jwt_required()
def add_student():
    data = request.json
    conn = get_db()

    try:
        conn.execute(
            "INSERT INTO students (name, email, class_name) VALUES (?, ?, ?)",
            (data["name"], data["email"], data["class_name"])
        )
        conn.commit()
        return jsonify({"message": "Student added"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# GET ALL STUDENTS
# ==============================
@bp.route("/", methods=["GET"])
@jwt_required()
def get_students():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students").fetchall()

    results = [
        dict(id=row["id"], name=row["name"], email=row["email"], class_name=row["class_name"])
        for row in rows
    ]

    return jsonify({"students": results, "total": len(results)}), 200


# ==============================
# GET STUDENT BY ID
# ==============================
@bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_student_by_id(id):
    conn = get_db()
    row = conn.execute("SELECT * FROM students WHERE id=?", (id,)).fetchone()

    if not row:
        return jsonify({"error": "Student not found"}), 404

    student = dict(id=row["id"], name=row["name"], email=row["email"], class_name=row["class_name"])
    return jsonify({"student": student}), 200


# ==============================
# UPDATE STUDENT
# ==============================
@bp.route("/<id>", methods=["PUT"])
@jwt_required()
def update_student(id):
    data = request.json
    conn = get_db()

    try:
        conn.execute(
            "UPDATE students SET name=?, email=?, class_name=? WHERE id=?",
            (data["name"], data["email"], data["class_name"], id)
        )
        conn.commit()
        return jsonify({"message": "Updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# DELETE STUDENT
# ==============================
@bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_student(id):
    conn = get_db()

    try:
        conn.execute("DELETE FROM students WHERE id=?", (id,))
        conn.commit()
        return jsonify({"message": "Deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
