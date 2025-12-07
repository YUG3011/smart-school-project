"""
Automatic Attendance Marking API
Handles automatic face recognition-based attendance marking for students and teachers
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from smart_school_backend.utils.db import get_db
from datetime import datetime
import base64
import json
import numpy as np
from io import BytesIO
from PIL import Image

bp = Blueprint("automatic_attendance", __name__, url_prefix="/api/auto-attendance")


def process_face_image(image_data):
    """Process base64 image and extract face embedding"""
    try:
        import face_recognition
    except ImportError:
        return {"error": "face_recognition library not installed"}
    
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image_array = np.array(image)
        
        # Detect faces and get encodings
        face_encodings = face_recognition.face_encodings(image_array)
        
        if len(face_encodings) == 0:
            return {"error": "No face detected in image"}
        
        if len(face_encodings) > 1:
            return {"error": "Multiple faces detected. Please ensure only one person is in the image"}
        
        embedding = face_encodings[0].tolist()
        return {"embedding": embedding, "success": True}
    
    except Exception as e:
        return {"error": str(e)}


def find_matching_student(captured_embedding, tolerance=0.5):
    """Find matching student from database using face embedding"""
    try:
        import face_recognition
    except ImportError:
        return None
    
    try:
        conn = get_db()
        
        # Get all active face embeddings from database
        embeddings = conn.execute("""
            SELECT fe.id, fe.student_id, fe.embedding, s.name, s.email
            FROM face_embeddings fe
            JOIN students s ON fe.student_id = s.id
            WHERE fe.active = 1
        """).fetchall()
        
        if not embeddings:
            return None
        
        captured_embedding_np = np.array(captured_embedding)
        best_match = None
        best_confidence = 0
        
        for embedding_row in embeddings:
            stored_embedding = json.loads(embedding_row['embedding'])
            stored_embedding_np = np.array(stored_embedding)
            
            # Calculate face distance
            distance = face_recognition.face_distance([stored_embedding_np], captured_embedding_np)[0]
            confidence = 1 - distance
            
            # Check if within tolerance
            if distance <= tolerance and confidence > best_confidence:
                best_confidence = confidence
                best_match = {
                    'embedding_id': embedding_row['id'],
                    'student_id': embedding_row['student_id'],
                    'name': embedding_row['name'],
                    'email': embedding_row['email'],
                    'distance': float(distance),
                    'confidence': float(confidence)
                }
        
        return best_match
    
    except Exception as e:
        print(f"Error finding match: {e}")
        return None


def find_matching_teacher(captured_embedding, tolerance=0.5):
    """Find matching teacher from database using face embedding"""
    try:
        import face_recognition
    except ImportError:
        return None
    
    try:
        conn = get_db()
        
        # Get all active teacher face embeddings
        embeddings = conn.execute("""
            SELECT fe.id, fe.teacher_id, fe.embedding, t.name, t.email
            FROM face_embeddings fe
            JOIN teachers t ON fe.teacher_id = t.id
            WHERE fe.active = 1 AND fe.teacher_id IS NOT NULL
        """).fetchall()
        
        if not embeddings:
            return None
        
        captured_embedding_np = np.array(captured_embedding)
        best_match = None
        best_confidence = 0
        
        for embedding_row in embeddings:
            stored_embedding = json.loads(embedding_row['embedding'])
            stored_embedding_np = np.array(stored_embedding)
            
            distance = face_recognition.face_distance([stored_embedding_np], captured_embedding_np)[0]
            confidence = 1 - distance
            
            if distance <= tolerance and confidence > best_confidence:
                best_confidence = confidence
                best_match = {
                    'embedding_id': embedding_row['id'],
                    'teacher_id': embedding_row['teacher_id'],
                    'name': embedding_row['name'],
                    'email': embedding_row['email'],
                    'distance': float(distance),
                    'confidence': float(confidence)
                }
        
        return best_match
    
    except Exception as e:
        print(f"Error finding teacher match: {e}")
        return None


def check_already_marked(entity_id, entity_type='student'):
    """Check if attendance already marked today for this person"""
    try:
        conn = get_db()
        today = datetime.now().strftime("%Y-%m-%d")
        
        if entity_type == 'student':
            result = conn.execute("""
                SELECT id FROM student_attendance 
                WHERE student_id = ? AND date = ?
                LIMIT 1
            """, (entity_id, today)).fetchone()
        else:  # teacher
            result = conn.execute("""
                SELECT id FROM teacher_attendance 
                WHERE teacher_id = ? AND date = ?
                LIMIT 1
            """, (entity_id, today)).fetchone()
        
        return result is not None
    
    except Exception as e:
        print(f"Error checking attendance: {e}")
        return False


# ========================================
# Mark Student Attendance Automatically
# ========================================
@bp.route("/mark-student", methods=["POST"])
@jwt_required()
def mark_student_attendance():
    """
    Mark student attendance automatically using face recognition
    
    Request:
    {
        "image": "base64_encoded_image",
        "tolerance": 0.5  (optional)
    }
    """
    try:
        # Log request details for debugging
        print(f"[DEBUG] Request Content-Type: {request.content_type}")
        print(f"[DEBUG] Request Content-Length: {request.content_length}")
        
        data = request.get_json()
        if not data:
            print("[DEBUG] No JSON data in request")
            return jsonify({"error": "No JSON data in request"}), 400
        
        image_data = data.get("image")
        tolerance = data.get("tolerance", 0.5)
        
        print(f"[DEBUG] Image data length: {len(image_data) if image_data else 0}")
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        # Process captured image
        result = process_face_image(image_data)
        if "error" in result:
            return jsonify(result), 400
        
        captured_embedding = result["embedding"]
        
        # Find matching student
        match = find_matching_student(captured_embedding, tolerance)
        if not match:
            return jsonify({
                "success": False,
                "error": "Face not recognized. Please try again or check camera."
            }), 200
        
        # Check if already marked today
        if check_already_marked(match['student_id'], 'student'):
            return jsonify({
                "success": False,
                "error": f"Attendance already marked today for {match['name']}",
                "already_marked": True,
                "student_name": match['name']
            }), 200
        
        # Mark attendance
        conn = get_db()
        today = datetime.now().strftime("%Y-%m-%d")
        now = datetime.now().strftime("%H:%M:%S")
        
        try:
            conn.execute("""
                INSERT INTO student_attendance (student_id, date, status, marked_at)
                VALUES (?, ?, ?, ?)
            """, (match['student_id'], today, 'Present', now))
            conn.commit()
            
            return jsonify({
                "success": True,
                "message": f"Attendance marked for {match['name']}",
                "student_id": match['student_id'],
                "student_name": match['name'],
                "status": "Present",
                "date": today,
                "time": now,
                "confidence": match['confidence']
            }), 200
        
        except Exception as e:
            conn.rollback()
            return jsonify({
                "success": False,
                "error": f"Database error: {str(e)}"
            }), 500
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ========================================
# Mark Teacher Attendance Automatically
# ========================================
@bp.route("/mark-teacher", methods=["POST"])
@jwt_required()
def mark_teacher_attendance():
    """
    Mark teacher attendance automatically using face recognition
    
    Request:
    {
        "image": "base64_encoded_image",
        "tolerance": 0.5  (optional)
    }
    """
    try:
        data = request.get_json()
        image_data = data.get("image")
        tolerance = data.get("tolerance", 0.5)
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        # Process captured image
        result = process_face_image(image_data)
        if "error" in result:
            return jsonify(result), 400
        
        captured_embedding = result["embedding"]
        
        # Find matching teacher
        match = find_matching_teacher(captured_embedding, tolerance)
        if not match:
            return jsonify({
                "success": False,
                "error": "Face not recognized. Please try again or check camera."
            }), 200
        
        # Check if already marked today
        if check_already_marked(match['teacher_id'], 'teacher'):
            return jsonify({
                "success": False,
                "error": f"Attendance already marked today for {match['name']}",
                "already_marked": True,
                "teacher_name": match['name']
            }), 200
        
        # Mark attendance
        conn = get_db()
        today = datetime.now().strftime("%Y-%m-%d")
        now = datetime.now().strftime("%H:%M:%S")
        
        try:
            conn.execute("""
                INSERT INTO teacher_attendance (teacher_id, date, status, marked_at)
                VALUES (?, ?, ?, ?)
            """, (match['teacher_id'], today, 'Present', now))
            conn.commit()
            
            return jsonify({
                "success": True,
                "message": f"Attendance marked for {match['name']}",
                "teacher_id": match['teacher_id'],
                "teacher_name": match['name'],
                "status": "Present",
                "date": today,
                "time": now,
                "confidence": match['confidence']
            }), 200
        
        except Exception as e:
            conn.rollback()
            return jsonify({
                "success": False,
                "error": f"Database error: {str(e)}"
            }), 500
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ========================================
# Get Today's Attendance Status
# ========================================
@bp.route("/check-status/<entity_type>/<int:entity_id>", methods=["GET"])
@jwt_required()
def check_attendance_status(entity_type, entity_id):
    """Check if attendance already marked today for student/teacher"""
    try:
        already_marked = check_already_marked(entity_id, entity_type)
        
        if already_marked:
            conn = get_db()
            today = datetime.now().strftime("%Y-%m-%d")
            
            if entity_type == 'student':
                record = conn.execute("""
                    SELECT * FROM student_attendance
                    WHERE student_id = ? AND date = ?
                """, (entity_id, today)).fetchone()
            else:
                record = conn.execute("""
                    SELECT * FROM teacher_attendance
                    WHERE teacher_id = ? AND date = ?
                """, (entity_id, today)).fetchone()
            
            return jsonify({
                "marked": True,
                "status": record['status'],
                "time": record['marked_at']
            }), 200
        
        return jsonify({"marked": False}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Attendance Records for Date
# ========================================
@bp.route("/records/<entity_type>", methods=["GET"])
@jwt_required()
def get_attendance_records(entity_type):
    """Get attendance records for date (admin view)"""
    try:
        date = request.args.get("date", datetime.now().strftime("%Y-%m-%d"))
        
        conn = get_db()
        
        if entity_type == 'students':
            records = conn.execute("""
                SELECT sa.id, sa.student_id, s.name, s.email, s.class_name,
                       sa.date, sa.status, sa.marked_at
                FROM student_attendance sa
                JOIN students s ON sa.student_id = s.id
                WHERE sa.date = ?
                ORDER BY sa.marked_at DESC
            """, (date,)).fetchall()
        else:  # teachers
            records = conn.execute("""
                SELECT ta.id, ta.teacher_id, t.name, t.email,
                       ta.date, ta.status, ta.marked_at
                FROM teacher_attendance ta
                JOIN teachers t ON ta.teacher_id = t.id
                WHERE ta.date = ?
                ORDER BY ta.marked_at DESC
            """, (date,)).fetchall()
        
        return jsonify({
            "date": date,
            "records": [dict(row) for row in records],
            "total": len(records)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
