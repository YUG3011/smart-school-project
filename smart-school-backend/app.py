# app.py
from flask import Flask
from flask_cors import CORS
from utils.db import close_db

# Import Blueprints
from routes.auth import bp as auth_bp
from routes.students import bp as students_bp
from routes.teachers import bp as teachers_bp
from routes.attendance import bp as attendance_bp
from routes.timetable import bp as timetable_bp
from routes.chatbot import chatbot_bp

app = Flask(__name__)

# SECRET KEY for JWT (used by PyJWT)
app.config["SECRET_KEY"] = "SMART_SCHOOL_SECRET_KEY_123"

# Enable CORS
CORS(app)

# -------------------------------
# Register API Blueprints
# -------------------------------
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(students_bp, url_prefix="/api/students")
app.register_blueprint(teachers_bp, url_prefix="/api/teachers")
app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
app.register_blueprint(timetable_bp, url_prefix="/api/timetable")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")

# Home route
@app.route("/")
def home():
    return {
        "message": "Smart School Backend running",
        "status": "ok"
    }, 200

# Close DB connection
app.teardown_appcontext(close_db)

if __name__ == "__main__":
    app.run(debug=True)
