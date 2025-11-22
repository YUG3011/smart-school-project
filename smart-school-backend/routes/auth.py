from flask import Blueprint, request, jsonify
import bcrypt
from flask_jwt_extended import create_access_token
from utils.db import get_db

bp = Blueprint("auth", __name__)

@bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    conn = get_db()
    user = conn.execute("""
        SELECT * FROM users WHERE email=? AND role=?
    """, (email, role)).fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # bcrypt password check
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid password"}), 401

    identity = str(user["id"])

    extra_claims = {
        "role": user["role"],
        "email": user["email"]
    }

    token = create_access_token(identity=identity, additional_claims=extra_claims)

    return jsonify({
        "message": "Login successful",
        "role": user["role"],
        "token": token
    })
