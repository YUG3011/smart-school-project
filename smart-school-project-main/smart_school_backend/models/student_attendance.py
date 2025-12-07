"""
Student Attendance Model
Handles database operations for student attendance tracking
"""

from datetime import date, datetime
from smart_school_backend.utils.db import get_db


def create_student_attendance_table():
    """Create student_attendance table if it doesn't exist"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            class_name TEXT NOT NULL,
            date DATE NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'leave')),
            marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            marked_by INTEGER,
            notes TEXT,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(marked_by) REFERENCES users(id),
            UNIQUE(student_id, date)
        )
    """)
    
    # Create index for faster queries
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_student_attendance_date 
        ON student_attendance(date)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_student_attendance_student 
        ON student_attendance(student_id, date)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_student_attendance_class 
        ON student_attendance(class_name, date)
    """)
    
    db.commit()


def mark_attendance(student_id, class_name, status, date_str=None, notes=None, marked_by=None):
    """
    Mark or update attendance for a student
    
    Args:
        student_id: Student ID
        class_name: Class name
        status: 'present', 'absent', or 'leave'
        date_str: Date in YYYY-MM-DD format (defaults to today)
        notes: Optional notes
        marked_by: User ID of who marked attendance
    
    Returns:
        dict with attendance record or error
    """
    if date_str is None:
        date_str = date.today().isoformat()
    
    if status not in ['present', 'absent', 'leave']:
        return {"error": "Invalid status. Must be 'present', 'absent', or 'leave'"}
    
    db = get_db()
    cursor = db.cursor()
    
    # Verify student exists
    cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
    if cursor.fetchone() is None:
        return {"error": "Student not found"}
    
    try:
        # Check if attendance already exists
        cursor.execute(
            "SELECT id FROM student_attendance WHERE student_id = ? AND date = ?",
            (student_id, date_str)
        )
        existing = cursor.fetchone()
        
        if existing:
            # Update existing record
            cursor.execute("""
                UPDATE student_attendance 
                SET status = ?, notes = ?, marked_at = ?, marked_by = ?
                WHERE student_id = ? AND date = ?
            """, (status, notes, datetime.now().isoformat(), marked_by, student_id, date_str))
            record_id = existing[0]
        else:
            # Create new record
            cursor.execute("""
                INSERT INTO student_attendance 
                (student_id, class_name, date, status, notes, marked_by, marked_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (student_id, class_name, date_str, status, notes, marked_by, datetime.now().isoformat()))
            record_id = cursor.lastrowid
        
        db.commit()
        
        # Retrieve the record
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name, 
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.id = ?
        """, (record_id,))
        
        row = cursor.fetchone()
        return dict(row) if row else {"error": "Failed to retrieve record"}
    
    except Exception as e:
        return {"error": str(e)}


def get_today_attendance(class_name=None):
    """
    Get attendance for today
    
    Args:
        class_name: Optional class name filter
    
    Returns:
        List of attendance records
    """
    today = date.today().isoformat()
    db = get_db()
    cursor = db.cursor()
    
    if class_name:
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.date = ? AND sa.class_name = ?
            ORDER BY s.name
        """, (today, class_name))
    else:
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.date = ?
            ORDER BY sa.class_name, s.name
        """, (today,))
    
    return [dict(row) for row in cursor.fetchall()]


def get_attendance_by_date(date_str, class_name=None):
    """
    Get attendance for a specific date
    
    Args:
        date_str: Date in YYYY-MM-DD format
        class_name: Optional class name filter
    
    Returns:
        List of attendance records
    """
    db = get_db()
    cursor = db.cursor()
    
    if class_name:
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.date = ? AND sa.class_name = ?
            ORDER BY s.name
        """, (date_str, class_name))
    else:
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.date = ?
            ORDER BY sa.class_name, s.name
        """, (date_str,))
    
    return [dict(row) for row in cursor.fetchall()]


def get_student_attendance_history(student_id, limit=30):
    """
    Get attendance history for a student
    
    Args:
        student_id: Student ID
        limit: Number of recent records to return
    
    Returns:
        List of attendance records
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
               sa.date, sa.status, sa.marked_at, sa.notes
        FROM student_attendance sa
        JOIN students s ON sa.student_id = s.id
        WHERE sa.student_id = ?
        ORDER BY sa.date DESC
        LIMIT ?
    """, (student_id, limit))
    
    return [dict(row) for row in cursor.fetchall()]


def get_class_attendance_summary(class_name, start_date=None, end_date=None):
    """
    Get attendance summary for a class
    
    Args:
        class_name: Class name
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)
    
    Returns:
        List with student attendance summary
    """
    db = get_db()
    cursor = db.cursor()
    
    if start_date and end_date:
        cursor.execute("""
            SELECT 
                s.id,
                s.name,
                COUNT(CASE WHEN sa.status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN sa.status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN sa.status = 'leave' THEN 1 END) as leave_count,
                COUNT(sa.id) as total_records,
                ROUND(100.0 * COUNT(CASE WHEN sa.status = 'present' THEN 1 END) / COUNT(sa.id), 2) as attendance_percentage
            FROM students s
            LEFT JOIN student_attendance sa ON s.id = sa.student_id AND sa.class_name = ? AND sa.date BETWEEN ? AND ?
            WHERE s.class_name = ?
            GROUP BY s.id, s.name
            ORDER BY attendance_percentage DESC
        """, (class_name, start_date, end_date, class_name))
    else:
        cursor.execute("""
            SELECT 
                s.id,
                s.name,
                COUNT(CASE WHEN sa.status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN sa.status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN sa.status = 'leave' THEN 1 END) as leave_count,
                COUNT(sa.id) as total_records,
                ROUND(100.0 * COUNT(CASE WHEN sa.status = 'present' THEN 1 END) / NULLIF(COUNT(sa.id), 0), 2) as attendance_percentage
            FROM students s
            LEFT JOIN student_attendance sa ON s.id = sa.student_id AND sa.class_name = ?
            WHERE s.class_name = ?
            GROUP BY s.id, s.name
            ORDER BY attendance_percentage DESC
        """, (class_name, class_name))
    
    return [dict(row) for row in cursor.fetchall()]


def get_attendance_by_student(student_id, start_date=None, end_date=None):
    """
    Get attendance records for a student within date range
    
    Args:
        student_id: Student ID
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)
    
    Returns:
        List of attendance records
    """
    db = get_db()
    cursor = db.cursor()
    
    if start_date and end_date:
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.student_id = ? AND sa.date BETWEEN ? AND ?
            ORDER BY sa.date DESC
        """, (student_id, start_date, end_date))
    else:
        cursor.execute("""
            SELECT sa.id, sa.student_id, s.name as student_name, sa.class_name,
                   sa.date, sa.status, sa.marked_at, sa.notes
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.id
            WHERE sa.student_id = ?
            ORDER BY sa.date DESC
        """, (student_id,))
    
    return [dict(row) for row in cursor.fetchall()]


def delete_attendance(attendance_id):
    """
    Delete an attendance record
    
    Args:
        attendance_id: Attendance record ID
    
    Returns:
        Boolean indicating success
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM student_attendance WHERE id = ?", (attendance_id,))
    db.commit()
    
    return cursor.rowcount > 0


def bulk_mark_attendance(attendance_list):
    """
    Mark attendance for multiple students at once
    
    Args:
        attendance_list: List of dicts with keys: student_id, class_name, status, date, notes
    
    Returns:
        dict with results and errors
    """
    results = {"success": 0, "failed": 0, "errors": []}
    
    for attendance in attendance_list:
        result = mark_attendance(
            attendance.get("student_id"),
            attendance.get("class_name"),
            attendance.get("status"),
            attendance.get("date"),
            attendance.get("notes")
        )
        
        if "error" in result:
            results["failed"] += 1
            results["errors"].append(result)
        else:
            results["success"] += 1
    
    return results
