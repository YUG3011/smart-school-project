# smart_school_backend/app.py

from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os
import sys

# =====================================================================
# 1. FIX PYTHON PATHS SO ALL MODULES IMPORT CORRECTLY
# =====================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))      # smart_school_backend/
ROOT_DIR = os.path.dirname(BASE_DIR)                       # smart-school-project-main/

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
# 3. FLASK APP CONFIGURATION
# =====================================================================
app = Flask(__name__)

app.config["SECRET_KEY"] = "SMART_SCHOOL_SECRET_KEY"
app.config["JWT_SECRET_KEY"] = "SMART_SCHOOL_JWT_SECRET"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB
app.config["JSON_SORT_KEYS"] = False

# =====================================================================
# 4. CREATE TABLES ON STARTUP
# =====================================================================
with app.app_context():
    try:
        from smart_school_backend.models.student_attendance import create_student_attendance_table
        from smart_school_backend.models.teacher_attendance import create_teacher_attendance_table
        from smart_school_backend.models.face_recognition import create_face_embeddings_table
    except ImportError:
        from models.student_attendance import create_student_attendance_table
        from models.teacher_attendance import create_teacher_attendance_table
        from models.face_recognition import create_face_embeddings_table

    create_student_attendance_table()
    create_teacher_attendance_table()
    create_face_embeddings_table()

# =====================================================================
# 5. IMPORT BLUEPRINTS (FIXED)
# =====================================================================
try:
    from smart_school_backend.routes.auth import bp as auth_bp
    from smart_school_backend.routes.students import bp as students_bp
    from smart_school_backend.routes.teachers import bp as teachers_bp
    from smart_school_backend.routes.attendance import bp as attendance_bp, attendance_view_bp
    from smart_school_backend.routes.student_attendance import student_attendance_bp
    from smart_school_backend.routes.teacher_attendance import bp as teacher_attendance_bp
    from smart_school_backend.routes.face_recognition import face_recognition_bp
    from smart_school_backend.routes.automatic_attendance import bp as automatic_attendance_bp
    from smart_school_backend.routes.realtime_attendance import bp as realtime_attendance_bp
    from smart_school_backend.routes.timetable import bp as timetable_bp
    from smart_school_backend.routes.chatbot import chatbot_bp
except ImportError:
    from routes.auth import bp as auth_bp
    from routes.students import bp as students_bp
    from routes.teachers import bp as teachers_bp
    from routes.attendance import bp as attendance_bp, attendance_view_bp
    from routes.student_attendance import student_attendance_bp
    from routes.teacher_attendance import bp as teacher_attendance_bp
    from routes.face_recognition import face_recognition_bp
    from routes.automatic_attendance import bp as automatic_attendance_bp
    from routes.realtime_attendance import bp as realtime_attendance_bp
    from routes.timetable import bp as timetable_bp
    from routes.chatbot import chatbot_bp

# =====================================================================
# 6. INIT JWT
# =====================================================================
from flask_jwt_extended import JWTManager

jwt = JWTManager(app)

# =====================================================================
# 7. CORS ENABLED
# =====================================================================
CORS(app)

# =====================================================================
# 8. ERROR HANDLERS
# =====================================================================
from werkzeug.exceptions import BadRequest

@app.errorhandler(400)
def bad_request(e):
    return {"error": f"Bad request: {str(e)}"}, 400

@app.errorhandler(422)
def unprocessable(e):
    return {"error": f"Invalid JSON or malformed request: {str(e)}"}, 422

@app.errorhandler(413)
def file_too_large(e):
    return {"error": "Uploaded file too large"}, 413

# =====================================================================
# 9. REGISTER BLUEPRINTS
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
# 10. DEFAULT ROUTE
# =====================================================================
@app.route("/")
def home():
    return {"status": "ok", "message": "Smart School Backend Running"}, 200

# =====================================================================
# 11. CLOSE DB AFTER EACH REQUEST
# =====================================================================
app.teardown_appcontext(close_db)

# =====================================================================
# 12. RUN SERVER
# =====================================================================
if __name__ == "__main__":
    app.run(debug=True)
