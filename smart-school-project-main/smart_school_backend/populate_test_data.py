#!/usr/bin/env python
"""
Create comprehensive test data for the Smart School System
"""

import sqlite3
from datetime import date, timedelta
import json
import numpy as np
import sys

db_path = "school.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Creating test data...\n")

    # 1. Add Teachers
    teachers = [
        ("John Smith", "john@school.com", "Mathematics"),
        ("Sarah Johnson", "sarah@school.com", "English"),
        ("Mike Davis", "mike@school.com", "Science"),
    ]

    for name, email, subject in teachers:
        try:
            cursor.execute(
                "INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)",
                (name, email, subject)
            )
            print(f"✓ Created teacher: {name}")
        except sqlite3.IntegrityError:
            pass

    # 2. Add Students
    students = [
        ("Alice Brown", "alice@school.com", "10A", "A", "101"),
        ("Bob Wilson", "bob@school.com", "10A", "A", "102"),
        ("Charlie Davis", "charlie@school.com", "10A", "B", "103"),
        ("Diana Evans", "diana@school.com", "10B", "A", "104"),
        ("Eva Fox", "eva@school.com", "10B", "A", "105"),
        ("Frank Green", "frank@school.com", "10B", "B", "106"),
        ("Grace Hayes", "grace@school.com", "11A", "A", "107"),
        ("Henry King", "henry@school.com", "11A", "B", "108"),
    ]

    for name, email, class_name, section, roll_no in students:
        try:
            cursor.execute(
                "INSERT INTO students (name, email, class_name, section, roll_no) VALUES (?, ?, ?, ?, ?)",
                (name, email, class_name, section, roll_no)
            )
            print(f"✓ Created student: {name}")
        except sqlite3.IntegrityError:
            pass

    conn.commit()

    # 3. Add Attendance Records for the last 10 days
    today = date.today()
    statuses = ["present", "absent", "present", "present", "present", "absent", "present", "present", "present", "present"]

    cursor.execute("SELECT id FROM students")
    student_ids = [row[0] for row in cursor.fetchall()]

    for i in range(10):
        current_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        for student_id in student_ids:
            status = statuses[i % len(statuses)]
            try:
                cursor.execute(
                    "INSERT INTO student_attendance (student_id, date, status) VALUES (?, ?, ?)",
                    (student_id, current_date, status)
                )
            except sqlite3.IntegrityError:
                pass

    print(f"\n✓ Added attendance records for {len(student_ids)} students over 10 days")

    # 4. Add dummy face embeddings (for testing face recognition)
    cursor.execute("SELECT id FROM students")
    for idx, (student_id,) in enumerate(cursor.fetchall(), 1):
        try:
            # Create a dummy embedding (128-D array)
            embedding = np.random.randn(128).tolist()
            embedding_json = json.dumps(embedding)
            
            cursor.execute(
                """INSERT INTO face_embeddings (student_id, embedding, is_active)
                   VALUES (?, ?, 1)""",
                (student_id, embedding_json)
            )
        except Exception as e:
            pass

    print(f"✓ Added face embeddings for enrolled students")

    conn.commit()
    conn.close()

    print("\n" + "="*50)
    print("DATABASE SETUP COMPLETE!")
    print("="*50)
    print(f"✓ Teachers: {len(teachers)}")
    print(f"✓ Students: {len(students)}")
    print(f"✓ Attendance Records: {len(student_ids) * 10}")
    print(f"✓ Face Embeddings: {len(student_ids)}")
    print("\nYou can now login and see data on dashboards!")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
