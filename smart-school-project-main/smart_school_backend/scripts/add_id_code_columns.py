#!/usr/bin/env python3
"""Add `id_code` TEXT column to students and teachers tables if missing."""
import sqlite3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "database" / "smart_school.db"

def ensure_col(conn, table, col, col_type='TEXT'):
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    cols = [r[1] for r in cur.fetchall()]
    if col in cols:
        print(f"{table} already has column {col}")
        return False
    print(f"Adding column {col} to {table}")
    cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
    conn.commit()
    return True

def main():
    if not DB_PATH.exists():
        print(f"Database not found: {DB_PATH}")
        sys.exit(1)
    conn = sqlite3.connect(str(DB_PATH))
    try:
        changed = False
        changed |= ensure_col(conn, 'students', 'id_code', 'TEXT')
        changed |= ensure_col(conn, 'teachers', 'id_code', 'TEXT')
        if changed:
            print("Migration applied: id_code columns added where needed.")
        else:
            print("No changes needed; id_code already present.")
    finally:
        conn.close()

if __name__ == '__main__':
    main()
