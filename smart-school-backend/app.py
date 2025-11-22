# app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)

    # ========== CONFIG ==========
    app.config["ENV"] = os.environ.get("FLASK_ENV", "development")
    app.config["DEBUG"] = app.config["ENV"] == "development"
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-dev-key")

    # ========== EXTENSIONS ==========
    CORS(app, resources={r"/*": {"origins": "*"}})
    jwt = JWTManager(app)

    # ===== Register Blueprints (Routes) =====
    try:
        from routes.auth import bp as auth_bp
        app.register_blueprint(auth_bp, url_prefix="/auth")
    except Exception as e:
        app.logger.warning("Could not register auth blueprint: %s", e)

    try:
        from routes.students import bp as students_bp
        app.register_blueprint(students_bp, url_prefix="/students")
    except Exception as e:
        app.logger.warning("Could not register students blueprint: %s", e)

    try:
        from routes.teachers import bp as teachers_bp
        app.register_blueprint(teachers_bp, url_prefix="/teachers")
    except Exception as e:
        app.logger.warning("Could not register teachers blueprint: %s", e)

    try:
        from routes.timetable import bp as timetable_bp
        app.register_blueprint(timetable_bp, url_prefix="/timetable")
    except Exception as e:
        app.logger.warning("Could not register timetable blueprint: %s", e)

    try:
        from routes.attendance import bp as attendance_bp
        app.register_blueprint(attendance_bp, url_prefix="/attendance")
    except Exception as e:
        app.logger.warning("Could not register attendance blueprint: %s", e)

    # ========== HEALTH CHECK ==========
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({"status": "ok", "message": "Smart School Backend running"}), 200

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "message": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found", "message": str(e)}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

    return app


if __name__ == "__main__":
    # ===== Initialize DB tables here =====
    try:
        from models.student import create_students_table
        create_students_table()
        print("✔ Students table ready.")
    except Exception as e:
        print("⚠ Could not create students table:", e)

    # ===== Create App =====
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)
