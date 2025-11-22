# routes/students.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils.db import get_db

bp = Blueprint("students", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def get_students():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students").fetchall()
    return jsonify([dict(row) for row in rows])

@bp.route("/", methods=["POST"])
@jwt_required()
def add_student():
    data = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO students (name, email, class_name) VALUES (?, ?, ?)",
        (data["name"], data["email"], data["class_name"])
    )
    conn.commit()
    return jsonify({"message": "Student added"}), 201

@bp.route("/<id>", methods=["PUT"])
@jwt_required()
def update_student(id):
    data = request.json
    conn = get_db()
    conn.execute(
        "UPDATE students SET name=?, email=?, class_name=? WHERE id=?",
        (data["name"], data["email"], data["class_name"], id),
    )
    conn.commit()
    return jsonify({"message": "Updated"}), 200

@bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_student(id):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE id=?", (id,))
    conn.commit()
    return jsonify({"message": "Deleted"}), 200
