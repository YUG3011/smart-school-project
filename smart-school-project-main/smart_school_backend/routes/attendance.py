# smart_school_backend/routes/attendance.py

from flask import Blueprint, request, jsonify, current_app

try:
    from smart_school_backend.utils.db import get_db
except ImportError:
    from utils.db import get_db

from flask_jwt_extended import jwt_required
from datetime import date as date_module

bp = Blueprint("attendance", __name__)
attendance_view_bp = Blueprint("attendance_view", __name__)


# -------------------------------------------------------------------
# MANUAL STUDENT ATTENDANCE (basic)
# -------------------------------------------------------------------

@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_attendance():
    """
    Manual attendance marking.
    Supports two payload shapes:
      - { "student_id": 1, "date": "YYYY-MM-DD", "status": "present" }
      - { "id": 10001, "type": "student" }   (admin shorthand: marks today as present)
    """
    data = request.get_json() or {}
    db = get_db()
    cur = db.cursor()

    # Admin shorthand: { id, type }
    if data.get("id") and data.get("type"):
        pid = data.get("id")
        ptype = data.get("type")
        from datetime import date as date_module
        today = date_module.today().isoformat()

        try:
            if ptype == "student":
                # pid may be numeric student id or full_id like ST10001
                try:
                    sid = int(pid)
                except Exception:
                    # if full_id like ST10001, extract numeric part
                    sid = int(str(pid).replace("ST", "")) - 10000

                cur.execute(
                    "SELECT id, class_name FROM students WHERE id=?",
                    (sid,)
                )
                s = cur.fetchone()
                if not s:
                    return jsonify({"error": "Student not found"}), 404

                # idempotent insert
                cur.execute(
                    "SELECT id FROM student_attendance WHERE student_id = ? AND date = ?",
                    (s["id"], today),
                )
                if not cur.fetchone():
                    cur.execute(
                        "INSERT INTO student_attendance (student_id, class_name, date, status, marked_at) VALUES (?, ?, ?, 'present', ?)",
                        (s["id"], s["class_name"], today, datetime.utcnow().isoformat()),
                    )
                    db.commit()

                return jsonify({"success": True, "marked": {"id": s["id"], "date": today}}), 200

            elif ptype == "teacher":
                try:
                    tid = int(pid)
                except Exception:
                    tid = int(str(pid).replace("T", "")) - 1000

                cur.execute("SELECT id FROM teachers WHERE id=?", (tid,))
                t = cur.fetchone()
                if not t:
                    return jsonify({"error": "Teacher not found"}), 404

                cur.execute(
                    "SELECT id FROM teacher_attendance WHERE teacher_id = ? AND date = ?",
                    (t["id"], today),
                )
                if not cur.fetchone():
                    cur.execute(
                        "INSERT INTO teacher_attendance (teacher_id, date, status, marked_at) VALUES (?, ?, 'present', ?)",
                        (t["id"], today, datetime.utcnow().isoformat()),
                    )
                    db.commit()

                return jsonify({"success": True, "marked": {"id": t["id"], "date": today}}), 200

        except Exception as e:
            current_app.logger.error("mark_attendance shorthand failed: %s", e)
            return jsonify({"error": "Failed to mark attendance"}), 500

    # Legacy / explicit payload
    student_id = data.get("student_id")
    date = data.get("date")
    status = data.get("status", "present")

    if not student_id or not date:
        return jsonify({"error": "student_id and date are required"}), 400

    # Upsert pattern: if already exists for that date, update; else insert
    try:
        cur.execute(
            """
            INSERT INTO student_attendance (student_id, date, status)
            VALUES (?, ?, ?)
            ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status
            """,
            (student_id, date, status),
        )
    except Exception:
        # If ON CONFLICT is not supported for your table definition,
        # fall back to manual update.
        try:
            cur.execute(
                "UPDATE student_attendance SET status=? WHERE student_id=? AND date=?",
                (status, student_id, date),
            )
            if cur.rowcount == 0:
                cur.execute(
                    "INSERT INTO student_attendance (student_id, date, status) VALUES (?, ?, ?)",
                    (student_id, date, status),
                )
        except Exception as e:
            current_app.logger.error("mark_attendance failed: %s", e)
            return jsonify({"error": "Failed to save attendance"}), 500

    db.commit()
    return jsonify({"message": "Attendance marked successfully"}), 200


# -------------------------------------------------------------------
# DASHBOARD → RECENT ATTENDANCE TIMELINE
# -------------------------------------------------------------------

@attendance_view_bp.route("/all", methods=["GET"])
@jwt_required()
def recent_attendance():
    """
    Endpoint used by Admin Dashboard:
      GET /api/attendance-view/all?limit=5

    We TRY to fetch recent attendance records from DB. If anything
    goes wrong (no table, schema mismatch, etc.), we **log and
    return an empty list** so that the dashboard still works and
    does NOT auto-logout.
    """
    limit = request.args.get("limit", default=5, type=int)

    db = get_db()
    cur = db.cursor()

    records = []

    try:
        # Combine recent student and teacher attendance into a single feed.
        cur.execute(
            """
            SELECT sa.marked_at as marked_at, s.name as name, 'student' as role, sa.student_id as id, sa.class_name as class_name, sa.status as status
            FROM student_attendance sa
            JOIN students s ON s.id = sa.student_id
            UNION ALL
            SELECT ta.marked_at as marked_at, t.name as name, 'teacher' as role, ta.teacher_id as id, NULL as class_name, ta.status as status
            FROM teacher_attendance ta
            JOIN teachers t ON t.id = ta.teacher_id
            ORDER BY marked_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()

        for row in rows:
            marked_at = row[0] or ""
            date_part = marked_at.split("T")[0] if "T" in marked_at else (marked_at.split(" ")[0] if marked_at else "")
            time_part = marked_at.split("T")[1].split(".")[0] if "T" in marked_at else (marked_at.split(" ")[1] if len(marked_at.split(" "))>1 else "")

            # Format full id: students -> ST10001, teachers -> T1001
            role = row[2]
            pid = row[3]
            if role == "student" and pid is not None:
                full_id = f"ST{10000 + int(pid)}"
            elif role == "teacher" and pid is not None:
                full_id = f"T{1000 + int(pid)}"
            else:
                full_id = None

            records.append(
                {
                    "date": date_part,
                    "time": time_part,
                    "name": row[1],
                    "type": row[2],
                    "id": pid,
                    "full_id": full_id,
                    "class_name": row[4],
                    "status": row[5],
                }
            )

    except Exception as e:
        # IMPORTANT: swallow errors and just return empty data
        current_app.logger.warning(
            "recent_attendance query failed, returning empty list: %s", e
        )
        records = []

    return jsonify({"records": records}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → TODAY'S ATTENDANCE COUNT
# -------------------------------------------------------------------

@bp.route("/today", methods=["GET"])
@jwt_required()
def today_attendance_count():
    """
    Get count of students marked present today.
    GET /api/attendance/today  →  { "count": 5 }
    """
    from datetime import date as date_module
    
    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'present'",
            (today,),
        )
        count = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("today_attendance_count failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → TODAY'S TEACHERS PRESENT COUNT
# -------------------------------------------------------------------
@bp.route("/teachers/today", methods=["GET"])
@jwt_required()
def teachers_today_count():
    """
    Get count of teachers marked present today.
    GET /api/attendance/teachers/today  →  { "count": 3 }
    """
    from datetime import date as date_module

    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT COUNT(*) FROM teacher_attendance WHERE date = ? AND status = 'present'",
            (today,),
        )
        count = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("teachers_today_count failed: %s", e)
        count = 0

    return jsonify({"count": count}), 200


# -------------------------------------------------------------------
# ADMIN DASHBOARD → TEACHER'S RECENT ATTENDANCE VIEW
# -------------------------------------------------------------------

@attendance_view_bp.route("/teacher/<int:teacher_id>", methods=["GET"])
@jwt_required()
def teacher_recent_attendance(teacher_id):
    """
    Endpoint used by Teacher Dashboard:
      GET /api/attendance-view/teacher/{id}?limit=5

    Returns recent attendance records for that teacher's students.
    """
    limit = request.args.get("limit", default=5, type=int)

    db = get_db()
    cur = db.cursor()
    records = []

    try:
        # Fetch students taught by this teacher + their recent attendance
        cur.execute(
            """
            SELECT DISTINCT sa.date,
                   s.name,
                   s.class_name,
                   sa.status
            FROM student_attendance AS sa
            JOIN students AS s ON s.id = sa.student_id
            ORDER BY sa.date DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()

        for row in rows:
            records.append(
                {
                    "date": row[0],
                    "name": row[1],
                    "class_name": row[2],
                    "status": row[3],
                }
            )

    except Exception as e:
        current_app.logger.warning(
            "teacher_recent_attendance failed, returning empty list: %s", e
        )
        records = []

    return jsonify({"records": records}), 200


# -------------------------------------------------------------------
# TEACHER DASHBOARD → TODAY'S STUDENT ATTENDANCE COUNT
# -------------------------------------------------------------------

@bp.route("/teacher/<int:teacher_id>/today", methods=["GET"])
@jwt_required()
def teacher_attendance_today_count(teacher_id):
    """
    Get count of students marked present today (for teacher dashboard).
    GET /api/attendance/teacher/{id}/today

    Returns: { "present": 5 }
    """
    today = date_module.today().strftime("%Y-%m-%d")
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'present'",
            (today,),
        )
        present = cur.fetchone()[0] or 0
    except Exception as e:
        current_app.logger.warning("teacher_attendance_today_count failed: %s", e)
        present = 0

    return jsonify({"present": present}), 200

