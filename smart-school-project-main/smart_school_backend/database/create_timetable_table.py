import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "smart_school.db")

print("Using database:", DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("Creating timetable table...")

cursor.execute("DROP TABLE IF EXISTS timetable")

cursor.execute("""
    CREATE TABLE timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT NOT NULL,
        section TEXT NOT NULL,
        subject TEXT NOT NULL,
        teacher_name TEXT NOT NULL,
        day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT
    )
""")

conn.commit()
conn.close()

print("✔ timetable table created successfully!")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(timetable)")
columns = [info[1] for info in cursor.fetchall()]
print(f"Verified columns: {columns}")
conn.close()