from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models.user import get_user_by_email
from flask_jwt_extended import create_access_token

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"error": "Missing fields"}), 400

    # Get user from DB
    user = get_user_by_email(email)

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Verify role
    if user["role"] != role:
        return jsonify({"error": "Incorrect role"}), 401

    # Verify password
    try:
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": "Password hash error", "details": str(e)}), 500

    # Generate token
    token = create_access_token(identity={
        "id": user["id"],
        "email": user["email"],
        "role": user["role"]
    })

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": user["role"],
        "id": user["id"],
        "email": user["email"]
    }), 200
