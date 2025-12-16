import sqlite3
import os

# Correct path when script is executed from: smart_school_backend/
db_path = os.path.join("database", "smart_school.db")
output = "schema.txt"

print("Trying to open DB at:", os.path.abspath(db_path))

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT sql FROM sqlite_master WHERE type='table'")
rows = cursor.fetchall()

with open(output, "w", encoding="utf-8") as f:
    for row in rows:
        if row[0] is not None:
            f.write(row[0] + ";\n\n")

conn.close()
print("Schema exported to schema.txt")
