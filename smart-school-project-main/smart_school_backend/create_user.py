# create_user.py
import sqlite3
import bcrypt

email = "admin@school.com"
password = "admin123"
role = "admin"

conn = sqlite3.connect("school.db")
cursor = conn.cursor()

# Generate bcrypt hash
hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

try:
    cursor.execute("""
        INSERT INTO users (email, password, role)
        VALUES (?, ?, ?)
    """, (email, hashed.decode("utf-8"), role))
    conn.commit()
    print("Admin created successfully!")
except sqlite3.IntegrityError:
    print("Admin already exists.")

conn.close()
