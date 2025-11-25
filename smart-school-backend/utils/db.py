import sqlite3
from flask import g

DB_PATH = "school.db"


# ---------- GET DB CONNECTION ----------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
        g.db.row_factory = sqlite3.Row
    return g.db


# ---------- CLOSE DB CONNECTION ----------
def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
