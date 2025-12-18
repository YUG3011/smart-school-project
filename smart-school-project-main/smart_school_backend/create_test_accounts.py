#!/usr/bin/env python3
"""
create_test_accounts.py

Create sample admin, teacher, student and parent accounts and matching student/teacher records.

Run from the backend folder:
  python create_test_accounts.py
"""
from werkzeug.security import generate_password_hash
from utils.db import get_db
from app import app


def insert_if_missing(cur, table, where_clause, params, insert_sql, insert_params):
    cur.execute(f"SELECT 1 FROM {table} WHERE {where_clause}", params)
    if cur.fetchone():
        return False
    cur.execute(insert_sql, insert_params)
    return True


def main():
    with app.app_context():
        db = get_db()
        cur = db.cursor()

        # Ensure admin exists (use existing helper if present)
        admin_email = "admin@school.com"
        admin_pw = "admin123"
        cur.execute("SELECT id FROM users WHERE email=?", (admin_email,))
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ("Super Admin", admin_email, generate_password_hash(admin_pw), "admin"),
            )
            print(f"Created admin: {admin_email} / {admin_pw}")
        else:
            print("Admin already exists")

        # Create a sample teacher record and user with same id
        teacher_email = "teacher1@school.com"
        teacher_pw = "teacher123"
        cur.execute("SELECT id FROM teachers WHERE email=?", (teacher_email,))
        trow = cur.fetchone()
        if not trow:
            cur.execute("INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)",
                        ("Alice Teacher", teacher_email, "Mathematics"))
            teacher_id = cur.lastrowid
            print(f"Inserted teacher record id={teacher_id}")
        else:
            teacher_id = trow[0]

        # Create corresponding user with same id if missing
        cur.execute("SELECT id FROM users WHERE email=?", (teacher_email,))
        if not cur.fetchone():
            # Insert user with explicit id to match teacher id
            cur.execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                        (teacher_id, "Alice Teacher", teacher_email, generate_password_hash(teacher_pw), "teacher"))
            print(f"Created teacher user: {teacher_email} / {teacher_pw}")
        else:
            print("Teacher user already exists")

        # Create a sample student record and user with same id
        student_email = "student1@school.com"
        student_pw = "student123"
        cur.execute("SELECT id FROM students WHERE email=?", (student_email,))
        srow = cur.fetchone()
        if not srow:
            cur.execute("INSERT INTO students (name, email, class_name, section) VALUES (?, ?, ?, ?)",
                        ("Bob Student", student_email, "5", "A"))
            student_id = cur.lastrowid
            print(f"Inserted student record id={student_id}")
        else:
            student_id = srow[0]

        cur.execute("SELECT id FROM users WHERE email=?", (student_email,))
        if not cur.fetchone():
            cur.execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                        (student_id, "Bob Student", student_email, generate_password_hash(student_pw), "student"))
            print(f"Created student user: {student_email} / {student_pw}")
        else:
            print("Student user already exists")

        # Parent account
        parent_email = "parent1@school.com"
        parent_pw = "parent123"
        cur.execute("SELECT id FROM users WHERE email=?", (parent_email,))
        if not cur.fetchone():
            cur.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                        ("Parent One", parent_email, generate_password_hash(parent_pw), "parent"))
            print(f"Created parent user: {parent_email} / {parent_pw}")
        else:
            print("Parent user already exists")

        db.commit()


if __name__ == "__main__":
    main()
