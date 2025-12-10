#!/usr/bin/env python
"""
Setup test data in the database for testing
"""

import sqlite3
import sys

db_path = "school.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create users table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    # Insert test users
    test_users = [
        ("admin@school.com", "hashed_password_admin", "admin"),
        ("teacher@school.com", "hashed_password_teacher", "teacher"),
        ("student@school.com", "hashed_password_student", "student"),
    ]

    for email, password, role in test_users:
        try:
            cursor.execute(
                "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
                (email, password, role)
            )
            print(f"✓ Created user: {email} ({role})")
        except sqlite3.IntegrityError:
            print(f"  User already exists: {email}")

    conn.commit()
    conn.close()

    print("\n✓ Database setup complete!")
    print("\nTest Credentials:")
    print("  Admin:   admin@school.com / hashed_password_admin")
    print("  Teacher: teacher@school.com / hashed_password_teacher")
    print("  Student: student@school.com / hashed_password_student")

except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)
