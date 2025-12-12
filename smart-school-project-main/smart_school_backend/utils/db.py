import sqlite3
import os
from flask import g

# Absolute path to the database inside backend/database/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # utils/
DB_DIR = os.path.join(BASE_DIR, "..", "database")              # backend/database/
DB_PATH = os.path.join(DB_DIR, "smart_school.db")              # backend/database/smart_school.db

DB_PATH = os.path.abspath(DB_PATH)

# Ensure directory exists
os.makedirs(DB_DIR, exist_ok=True)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
