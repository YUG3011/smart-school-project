from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from smart_school_backend.utils.db import get_db

bp = Blueprint("teachers", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def get_teachers():
    conn = get_db()
    rows = conn.execute("SELECT * FROM teachers").fetchall()
    teachers = [dict(row) for row in rows]
    return jsonify({"teachers": teachers, "total": len(teachers)}), 200

@bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_teacher_by_id(id):
    conn = get_db()
    row = conn.execute("SELECT * FROM teachers WHERE id=?", (id,)).fetchone()
    if not row:
        return jsonify({"error": "Teacher not found"}), 404
    return jsonify({"teacher": dict(row)}), 200

@bp.route("/", methods=["POST"])
@jwt_required()
def add_teacher():
    data = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)",
        (data["name"], data["email"], data["subject"])
    )
    conn.commit()
    return jsonify({"message": "Teacher added"}), 201

@bp.route("/<id>", methods=["PUT"])
@jwt_required()
def update_teacher(id):
    data = request.json
    conn = get_db()
    conn.execute(
        "UPDATE teachers SET name=?, email=?, subject=? WHERE id=?",
        (data["name"], data["email"], data["subject"], id),
    )
    conn.commit()
    return jsonify({"message": "Updated"}), 200

@bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_teacher(id):
    conn = get_db()
    conn.execute("DELETE FROM teachers WHERE id=?", (id,))
    conn.commit()
    return jsonify({"message": "Deleted"}), 200
