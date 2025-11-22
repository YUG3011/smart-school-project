# utils/db.py
import sqlite3

DB_NAME = "school.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # return dict-like rows
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # USERS TABLE (Admin / Teacher / Student / Parent)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
    );
    """)

    # STUDENTS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        class_name TEXT
    );
    """)

    # TEACHERS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        subject TEXT
    );
    """)

    # TIMETABLE TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT,
        day TEXT,
        subject TEXT,
        teacher TEXT,
        time TEXT
    );
    """)

    # ATTENDANCE TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        date TEXT,
        time TEXT,
        status TEXT
    );
    """)

    conn.commit()
    conn.close()
