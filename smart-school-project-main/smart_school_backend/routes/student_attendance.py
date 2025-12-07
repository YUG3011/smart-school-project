"""
Student Attendance Routes
API endpoints for managing student attendance
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import date
from smart_school_backend.models.student_attendance import (
    create_student_attendance_table,
    mark_attendance,
    get_today_attendance,
    get_attendance_by_date,
    get_student_attendance_history,
    get_class_attendance_summary,
    get_attendance_by_student,
    delete_attendance,
    bulk_mark_attendance
)

bp = Blueprint("student_attendance", __name__, url_prefix="/api/student-attendance")


# ========================================
# Mark Attendance for a Student
# ========================================
@bp.route("/mark", methods=["POST"])
@jwt_required()
def mark_student_attendance():
    """Mark attendance for a student"""
    try:
        data = request.get_json()
        student_id = data.get("student_id")
        class_name = data.get("class_name")
        status = data.get("status")  # present, absent, leave
        attendance_date = data.get("date", date.today().isoformat())
        notes = data.get("notes")
        
        if not all([student_id, class_name, status]):
            return jsonify({"error": "Missing required fields: student_id, class_name, status"}), 400
        
        result = mark_attendance(student_id, class_name, status, attendance_date, notes)
        
        if "error" in result:
            return jsonify(result), 400
        
        return jsonify({
            "message": "Attendance marked successfully",
            "attendance": result
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Bulk Mark Attendance
# ========================================
@bp.route("/bulk-mark", methods=["POST"])
@jwt_required()
def bulk_mark_student_attendance():
    """Mark attendance for multiple students at once"""
    try:
        data = request.get_json()
        attendance_list = data.get("attendance", [])
        
        if not attendance_list:
            return jsonify({"error": "No attendance data provided"}), 400
        
        results = bulk_mark_attendance(attendance_list)
        
        return jsonify({
            "message": "Bulk attendance marking completed",
            "results": results
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Today's Attendance
# ========================================
@bp.route("/today", methods=["GET"])
@jwt_required()
def get_today():
    """Get today's attendance records for all students"""
    try:
        class_name = request.args.get("class_name")
        records = get_today_attendance(class_name)
        
        return jsonify({
            "attendance": records,
            "date": date.today().isoformat(),
            "total": len(records)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Attendance by Date
# ========================================
@bp.route("/by-date", methods=["GET"])
@jwt_required()
def get_by_date():
    """Get attendance records for a specific date"""
    try:
        attendance_date = request.args.get("date")
        class_name = request.args.get("class_name")
        
        if not attendance_date:
            return jsonify({"error": "Date parameter required (YYYY-MM-DD format)"}), 400
        
        records = get_attendance_by_date(attendance_date, class_name)
        
        return jsonify({
            "attendance": records,
            "date": attendance_date,
            "total": len(records)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Student Attendance History
# ========================================
@bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student_history(student_id):
    """Get attendance history for a specific student"""
    try:
        limit = request.args.get("limit", 30, type=int)
        records = get_student_attendance_history(student_id, limit)
        
        if not records:
            return jsonify({
                "attendance": [],
                "student_id": student_id,
                "message": "No attendance records found"
            }), 200
        
        return jsonify({
            "attendance": records,
            "student_id": student_id,
            "total": len(records)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Attendance by Date Range
# ========================================
@bp.route("/student/<int:student_id>/range", methods=["GET"])
@jwt_required()
def get_student_range(student_id):
    """Get attendance for a student within a date range"""
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if not (start_date and end_date):
            return jsonify({"error": "Both start_date and end_date required (YYYY-MM-DD format)"}), 400
        
        records = get_attendance_by_student(student_id, start_date, end_date)
        
        return jsonify({
            "attendance": records,
            "student_id": student_id,
            "start_date": start_date,
            "end_date": end_date,
            "total": len(records)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Class Attendance Summary
# ========================================
@bp.route("/class/<class_name>/summary", methods=["GET"])
@jwt_required()
def get_class_summary(class_name):
    """Get attendance summary for all students in a class"""
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        records = get_class_attendance_summary(class_name, start_date, end_date)
        
        return jsonify({
            "summary": records,
            "class_name": class_name,
            "start_date": start_date,
            "end_date": end_date,
            "total_students": len(records)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Delete Attendance Record
# ========================================
@bp.route("/<int:attendance_id>", methods=["DELETE"])
@jwt_required()
def delete_record(attendance_id):
    """Delete an attendance record"""
    try:
        success = delete_attendance(attendance_id)
        
        if not success:
            return jsonify({"error": "Attendance record not found"}), 404
        
        return jsonify({
            "message": "Attendance record deleted successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Stats Endpoint
# ========================================
@bp.route("/stats/overview", methods=["GET"])
@jwt_required()
def get_stats_overview():
    """Get overall attendance statistics"""
    try:
        from smart_school_backend.utils.db import get_db
        from datetime import datetime, timedelta
        
        db = get_db()
        cursor = db.cursor()
        
        today = date.today().isoformat()
        last_30_days = (date.today() - timedelta(days=30)).isoformat()
        
        # Total attendance records
        cursor.execute("SELECT COUNT(*) FROM student_attendance")
        total_records = cursor.fetchone()[0]
        
        # Today's records
        cursor.execute("SELECT COUNT(*) FROM student_attendance WHERE date = ?", (today,))
        today_records = cursor.fetchone()[0]
        
        # Present today
        cursor.execute("SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'present'", (today,))
        present_today = cursor.fetchone()[0]
        
        # Absent today
        cursor.execute("SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'absent'", (today,))
        absent_today = cursor.fetchone()[0]
        
        # Leave today
        cursor.execute("SELECT COUNT(*) FROM student_attendance WHERE date = ? AND status = 'leave'", (today,))
        leave_today = cursor.fetchone()[0]
        
        # Average attendance in last 30 days
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(*) as total_count
            FROM student_attendance 
            WHERE date >= ?
        """, (last_30_days,))
        
        stats = cursor.fetchone()
        avg_attendance = (stats[0] / stats[1] * 100) if stats[1] > 0 else 0
        
        return jsonify({
            "statistics": {
                "total_records": total_records,
                "today": {
                    "total_marked": today_records,
                    "present": present_today,
                    "absent": absent_today,
                    "leave": leave_today
                },
                "last_30_days": {
                    "average_attendance_percentage": round(avg_attendance, 2)
                }
            }
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
