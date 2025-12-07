# app.py

from flask import Flask
from flask_cors import CORS
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Database close function
try:
    from smart_school_backend.utils.db import close_db
except ImportError:
    from utils.db import close_db

# Create Flask Application FIRST (before blueprints)
app = Flask(__name__)

# SECRET KEY for tokens
app.config["SECRET_KEY"] = "SMART_SCHOOL_SECRET_KEY_123"

# JWT Configuration
from datetime import timedelta
app.config["JWT_SECRET_KEY"] = "SMART_SCHOOL_JWT_SECRET_123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

# Increase JSON payload size limit for large base64 images (default is 20MB, set to 50MB)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB
app.config["JSON_SORT_KEYS"] = False

# Initialize database tables within app context
with app.app_context():
    try:
        from smart_school_backend.models.face_recognition import create_face_embeddings_table
        from smart_school_backend.models.student_attendance import create_student_attendance_table
        from smart_school_backend.models.teacher_attendance import create_teacher_attendance_table
    except ImportError:
        from models.face_recognition import create_face_embeddings_table
        from models.student_attendance import create_student_attendance_table
        from models.teacher_attendance import create_teacher_attendance_table
    
    # Create tables
    create_face_embeddings_table()
    create_student_attendance_table()
    create_teacher_attendance_table()

# Import Blueprints (with fallback to relative imports)
try:
    from smart_school_backend.routes.auth import bp as auth_bp
    from smart_school_backend.routes.students import bp as students_bp
    from smart_school_backend.routes.teachers import bp as teachers_bp
    from smart_school_backend.routes.attendance import bp as attendance_bp
    from smart_school_backend.routes.timetable import bp as timetable_bp
    from smart_school_backend.routes.chatbot import chatbot_bp
    from smart_school_backend.routes.teacher_attendance import bp as teacher_attendance_bp
    from smart_school_backend.routes.student_attendance import bp as student_attendance_bp
    from smart_school_backend.routes.face_recognition import bp as face_recognition_bp
    from smart_school_backend.routes.automatic_attendance import bp as automatic_attendance_bp
    from smart_school_backend.routes.realtime_attendance import bp as realtime_attendance_bp
except ImportError:
    from routes.auth import bp as auth_bp
    from routes.students import bp as students_bp
    from routes.teachers import bp as teachers_bp
    from routes.attendance import bp as attendance_bp
    from routes.timetable import bp as timetable_bp
    from routes.chatbot import chatbot_bp
    from routes.teacher_attendance import bp as teacher_attendance_bp
    from routes.student_attendance import bp as student_attendance_bp
    from routes.face_recognition import bp as face_recognition_bp
    from routes.automatic_attendance import bp as automatic_attendance_bp
    from routes.realtime_attendance import bp as realtime_attendance_bp

# Initialize JWT
from flask_jwt_extended import JWTManager
jwt = JWTManager(app)

# Enable CORS
CORS(app)

# Error handlers for common issues
from werkzeug.exceptions import BadRequest
@app.errorhandler(400)
def handle_bad_request(e):
    return {"error": f"Bad request: {str(e)}"}, 400

@app.errorhandler(422)
def handle_unprocessable_entity(e):
    return {"error": f"Unprocessable entity (malformed JSON or invalid data): {str(e)}"}, 422

@app.errorhandler(413)
def handle_request_entity_too_large(e):
    return {"error": "Request too large - image file is too big"}, 413

# -------------------------------
# Register API Blueprints
# -------------------------------
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(students_bp, url_prefix="/api/students")
app.register_blueprint(teachers_bp, url_prefix="/api/teachers")
app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
app.register_blueprint(timetable_bp, url_prefix="/api/timetable")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
app.register_blueprint(teacher_attendance_bp, url_prefix="/api/teacher-attendance")
app.register_blueprint(student_attendance_bp, url_prefix="/api/student-attendance")
app.register_blueprint(face_recognition_bp, url_prefix="/api/face-recognition")
app.register_blueprint(automatic_attendance_bp, url_prefix="/api/auto-attendance")
app.register_blueprint(realtime_attendance_bp, url_prefix="/api/realtime-attendance")

# Home route
@app.route("/")
def home():
    return {
        "message": "Smart School Backend running",
        "status": "ok"
    }, 200

# Close DB connection after request
app.teardown_appcontext(close_db)

if __name__ == "__main__":
    app.run(debug=True)
