# routes/timetable.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.timetable import (
    get_timetable,
    add_timetable_entry,
    update_timetable_entry,
    delete_timetable_entry
)

bp = Blueprint("timetable", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_timetable():
    # query params: class, day
    class_name = request.args.get("class")
    day = request.args.get("day")
    rows = get_timetable(class_name=class_name, day=day)
    # convert sqlite Row to dict if needed
    return jsonify([dict(r) for r in rows]), 200

@bp.route("/", methods=["POST"])
@jwt_required()
def create_timetable():
    data = request.json or {}
    required = ["class_name", "day", "period", "subject"]
    for r in required:
        if r not in data:
            return jsonify({"error": f"Missing field: {r}"}), 400
    add_timetable_entry(data)
    return jsonify({"message": "Timetable entry created"}), 201

@bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def edit_timetable(id):
    data = request.json or {}
    update_timetable_entry(id, data)
    return jsonify({"message": "Updated"}), 200

@bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def remove_timetable(id):
    delete_timetable_entry(id)
    return jsonify({"message": "Deleted"}), 200
