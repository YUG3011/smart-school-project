# routes/auth.py
from flask import Blueprint, request, jsonify
from utils.jwt_manager import create_access_token
from utils.db import get_db
import bcrypt

bp = Blueprint("auth", __name__)

# ------------------------------
# LOGIN ROUTE
# ------------------------------
@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor()

    # Check if user exists
    cursor.execute("SELECT id, email, password, role FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    stored_hash = user["password"]

    # Check password using bcrypt
    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create JWT token
    token = create_access_token(identity={"id": user["id"], "role": user["role"]})

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": user["role"]
    }), 200
