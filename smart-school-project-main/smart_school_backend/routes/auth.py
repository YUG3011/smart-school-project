# smart_school_backend/routes/auth.py

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from models.user import validate_user, get_user_by_email

bp = Blueprint("auth", __name__)

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"error": "Missing fields"}), 400

    # Try fast password validation (validate_user will check hash)
    user = validate_user(email, password)

    # If validate_user returns None, user not found or invalid password
    if not user:
        # give a consistent message without leaking which part failed
        return jsonify({"error": "Invalid email or password"}), 401

    # Role verification (defense-in-depth)
    if user.get("role") != role:
        return jsonify({"error": "Incorrect role"}), 401

    # Generate token (identity = user id; we put email and role into additional claims)
    additional_claims = {"email": user["email"], "role": user["role"]}
    token = create_access_token(identity=user["id"], additional_claims=additional_claims)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": user["role"],
        "id": user["id"],
        "email": user["email"]
    }), 200


# Optional: a small ping endpoint to test token from front-end (not strictly required)
@bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "auth service up"}), 200
