from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os
import sys

# =====================================================================
# 1. FIX PYTHON PATHS
# =====================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))      # smart_school_backend/
ROOT_DIR = os.path.dirname(BASE_DIR)                       # project root

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# =====================================================================
# 2. LOAD DB CLOSE HANDLER
# =====================================================================
try:
    from smart_school_backend.utils.db import close_db
except ImportError:
    from utils.db import close_db

# =====================================================================
# 3. FLASK CONFIG
# =====================================================================
app = Flask(__name__)

app.config["SECRET_KEY"] = "SMART_SCHOOL_SECRET_KEY"
app.config["JWT_SECRET_KEY"] = "SMART_SCHOOL_JWT_SECRET"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024
app.config["JSON_SORT_KEYS"] = False

# =====================================================================
# 4. INITIALIZE TABLES
# =====================================================================
with app.app_context():
    try:
        from smart_school_backend.models.student_attendance import create_student_attendance_table
        from smart_school_backend.models.teacher_attendance import create_teacher_attendance_table
        from smart_school_backend.models.face_recognition import create_face_embeddings_table
    except:
        from models.student_attendance import create_student_attendance_table
        from models.teacher_attendance import create_teacher_attendance_table
        from models.face_recognition import create_face_embeddings_table

    create_student_attendance_table()
    create_teacher_attendance_table()
    create_face_embeddings_table()

# =====================================================================
# 5. IMPORT BLUEPRINTS
# =====================================================================
def safe_import_route(module_path, fallback_path, obj):
    """Safely import modules with fallback."""
    try:
        mod = __import__(module_path, fromlist=[obj])
        return getattr(mod, obj)
    except:
        mod = __import__(fallback_path, fromlist=[obj])
        return getattr(mod, obj)


auth_bp = safe_import_route("smart_school_backend.routes.auth", "routes.auth", "bp")
students_bp = safe_import_route("smart_school_backend.routes.students", "routes.students", "bp")
teachers_bp = safe_import_route("smart_school_backend.routes.teachers", "routes.teachers", "bp")

attendance_bp = safe_import_route("smart_school_backend.routes.attendance", "routes.attendance", "bp")
attendance_view_bp = safe_import_route("smart_school_backend.routes.attendance", "routes.attendance", "attendance_view_bp")

student_attendance_bp = safe_import_route("smart_school_backend.routes.student_attendance", "routes.student_attendance", "student_attendance_bp")
teacher_attendance_bp = safe_import_route("smart_school_backend.routes.teacher_attendance", "routes.teacher_attendance", "bp")

face_recognition_bp = safe_import_route("smart_school_backend.routes.face_recognition", "routes.face_recognition", "face_recognition_bp")

automatic_attendance_bp = safe_import_route("smart_school_backend.routes.automatic_attendance", "routes.automatic_attendance", "bp")
realtime_attendance_bp = safe_import_route("smart_school_backend.routes.realtime_attendance", "routes.realtime_attendance", "bp")

timetable_bp = safe_import_route("smart_school_backend.routes.timetable", "routes.timetable", "bp")
chatbot_bp = safe_import_route("smart_school_backend.routes.chatbot", "routes.chatbot", "chatbot_bp")

# =====================================================================
# 6. JWT SETUP
# =====================================================================
from flask_jwt_extended import JWTManager

jwt = JWTManager(app)

# =====================================================================
# 7. CORS
# =====================================================================
CORS(
    app,
    resources={r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True,
    }},
)

# =====================================================================
# 8. REGISTER BLUEPRINTS
# =====================================================================
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(students_bp, url_prefix="/api/students")
app.register_blueprint(teachers_bp, url_prefix="/api/teachers")

app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
app.register_blueprint(attendance_view_bp, url_prefix="/api/attendance-view")

app.register_blueprint(student_attendance_bp, url_prefix="/api/student-attendance")
app.register_blueprint(teacher_attendance_bp, url_prefix="/api/teacher-attendance")

app.register_blueprint(face_recognition_bp, url_prefix="/api/face-recognition")

app.register_blueprint(automatic_attendance_bp, url_prefix="/api/auto-attendance")
app.register_blueprint(realtime_attendance_bp, url_prefix="/api/realtime-attendance")

app.register_blueprint(timetable_bp, url_prefix="/api/timetable")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")

# =====================================================================
# 9. HEALTH CHECK
# =====================================================================
@app.route("/")
def home():
    return {"status": "running", "message": "Smart School Backend Running"}, 200

# =====================================================================
# 10. DEBUG TOKEN
# =====================================================================
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

@app.route("/api/auth/me")
@jwt_required()
def get_me():
    return {"identity": get_jwt_identity(), "claims": get_jwt()}, 200

# =====================================================================
# 11. CLOSE DB
# =====================================================================
app.teardown_appcontext(close_db)

# =====================================================================
# 12. RUN SERVER
# =====================================================================
if __name__ == "__main__":
    app.run(debug=True)
