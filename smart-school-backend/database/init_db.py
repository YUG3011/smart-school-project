# database/init_db.py

import os
from utils.db import init_db
from models.student import create_student_table
from models.teacher import create_teacher_table
from models.timetable import create_timetable_table   # ✅ NEW

DB_PATH = "school.db"

def initialize_database():
    print("Initializing database...")

    # Ensure DB exists or is created
    if not os.path.exists(DB_PATH):
        open(DB_PATH, "w").close()

    # Create base DB file and connection
    init_db()

    # Create tables one by one
    create_student_table()
    print("✔ Students table ready.")

    create_teacher_table()
    print("✔ Teachers table ready.")

    create_timetable_table()   # ✅ NEW
    print("✔ Timetable table ready.")

    print("Database setup completed successfully.")

if __name__ == "__main__":
    initialize_database()
