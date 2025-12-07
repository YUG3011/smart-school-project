# database/init_db.py

import os, sys

# Ensure project root is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from smart_school_backend.app import app
from smart_school_backend.models.student import create_student_table
from smart_school_backend.models.teacher import create_teacher_table
from smart_school_backend.models.timetable import create_timetable_table
from smart_school_backend.models.teacher_attendance import create_teacher_attendance_table
from smart_school_backend.models.user import create_user_table

DB_PATH = "school.db"

def initialize_database():
    print("Initializing database (v2)...")

    # Create the DB file if missing
    if not os.path.exists(DB_PATH):
        open(DB_PATH, "w").close()

    # Run inside Flask application context
    with app.app_context():
        print("... app context entered.")
        create_user_table()
        print("✔ Users table ready.")
        
        create_student_table()
        print("✔ Students table ready.")

        create_teacher_table()
        print("✔ Teachers table ready.")

        create_timetable_table()
        print("✔ Timetable table ready.")

        create_teacher_attendance_table()
        print("✔ Teacher Attendance table ready.")

    print("Database setup completed successfully (v2).")


if __name__ == "__main__":
    initialize_database()