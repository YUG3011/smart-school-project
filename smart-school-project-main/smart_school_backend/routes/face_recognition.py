"""
Face Recognition Routes
API endpoints for face enrollment and recognition
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import base64
import json
from io import BytesIO
from PIL import Image
import numpy as np

# Import face recognition functions
from smart_school_backend.models.face_recognition import (
    create_face_embeddings_table,
    store_face_embedding,
    get_all_active_embeddings,
    get_student_embeddings,
    get_embedding_by_id,
    update_embedding_confidence,
    deactivate_student_embeddings,
    delete_embedding,
    get_enrollment_stats,
    record_recognition_attempt,
    get_recognition_success_rate,
    get_students_needing_enrollment
)

from smart_school_backend.models.student_attendance import (
    create_student_attendance_table,
    mark_attendance
)

bp = Blueprint("face_recognition", __name__, url_prefix="/api/face-recognition")


def process_face_image(image_data):
    """
    Process base64 image data and extract face embedding
    
    Args:
        image_data: Base64 encoded image string
    
    Returns:
        Embedding array or error
    """
    try:
        # Import face_recognition - lazy import to handle optional dependency
        try:
            import face_recognition
        except ImportError:
            return {"error": "face_recognition library not installed"}
        
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
        
        # Return the encoding as list
        embedding = face_encodings[0].tolist()
        return {"embedding": embedding, "face_count": len(face_encodings)}
    
    except Exception as e:
        return {"error": str(e)}


def compare_faces(known_encodings, unknown_encoding, tolerance=0.6):
    """
    Compare face encodings
    
    Args:
        known_encodings: List of known face encodings
        unknown_encoding: Unknown face encoding to compare
        tolerance: How much distance is acceptable (lower = stricter)
    
    Returns:
        List of match results with distances
    """
    try:
        import face_recognition
    except ImportError:
        return {"error": "face_recognition library not installed"}
    
    try:
        # Convert to numpy arrays
        known_encodings_np = [np.array(enc) for enc in known_encodings]
        unknown_encoding_np = np.array(unknown_encoding)
        
        # Calculate distances
        distances = face_recognition.face_distance(known_encodings_np, unknown_encoding_np)
        
        # Find matches within tolerance
        matches = []
        for i, distance in enumerate(distances):
            if distance <= tolerance:
                matches.append({
                    "index": i,
                    "distance": float(distance),
                    "confidence": float(1 - distance)  # Convert distance to confidence
                })
        
        # Sort by confidence (best match first)
        matches.sort(key=lambda x: x["confidence"], reverse=True)
        
        return {"matches": matches}
    
    except Exception as e:
        return {"error": str(e)}


# ========================================
# Enroll Student Face
# ========================================
@bp.route("/enroll", methods=["POST"])
@jwt_required()
def enroll_face():
    """Enroll a student's face for recognition"""
    try:
        data = request.get_json()
        student_id = data.get("student_id")
        image_data = data.get("image")  # Base64 encoded image
        notes = data.get("notes")
        
        if not student_id or not image_data:
            return jsonify({"error": "Missing student_id or image"}), 400
        
        # First, deactivate any existing enrollments for re-enrollment
        deactivate_student_embeddings(student_id)
        
        # Process image and get embedding
        result = process_face_image(image_data)
        
        if "error" in result:
            return jsonify(result), 400
        
        embedding = result["embedding"]
        
        # Store embedding
        store_result = store_face_embedding(
            student_id,
            embedding,
            confidence=1.0,
            notes=notes or "Face enrollment"
        )
        
        if "error" in store_result:
            return jsonify(store_result), 400
        
        return jsonify({
            "message": "Face enrolled successfully",
            "enrollment": store_result,
            "face_detected": result["face_count"]
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Recognize Face and Mark Attendance
# ========================================
@bp.route("/recognize", methods=["POST"])
@jwt_required()
def recognize_face():
    """
    Recognize a face and optionally mark attendance
    """
    try:
        data = request.get_json()
        image_data = data.get("image")  # Base64 encoded image
        tolerance = data.get("tolerance", 0.6)
        mark_attendance = data.get("mark_attendance", False)
        
        if not image_data:
            return jsonify({"error": "Missing image"}), 400
        
        # Process incoming image
        result = process_face_image(image_data)
        
        if "error" in result:
            return jsonify(result), 400
        
        unknown_embedding = result["embedding"]
        
        # Get all active enrollments
        all_embeddings = get_all_active_embeddings()
        
        if not all_embeddings:
            return jsonify({
                "message": "No enrolled faces in database",
                "matched": False
            }), 200
        
        # Extract encodings and metadata
        known_encodings = [np.array(emp["embedding"]) for emp in all_embeddings]
        
        # Compare faces
        matches = compare_faces(known_encodings, unknown_embedding, tolerance)
        
        if "error" in matches:
            return jsonify(matches), 400
        
        matched_students = []
        
        for match in matches["matches"]:
            embedding_info = all_embeddings[match["index"]]
            matched_students.append({
                "student_id": embedding_info["student_id"],
                "student_name": embedding_info["student_name"],
                "class_name": embedding_info["class_name"],
                "confidence": match["confidence"],
                "distance": match["distance"]
            })
            
            # Record recognition attempt
            record_recognition_attempt(
                embedding_info["student_id"],
                match["confidence"],
                matched=True
            )
        
        # If mark_attendance is requested and we have a match
        if mark_attendance and matched_students:
            best_match = matched_students[0]
            
            # Auto-mark attendance
            from smart_school_backend.models.student_attendance import mark_attendance as mark_att
            from datetime import date
            
            att_result = mark_att(
                best_match["student_id"],
                best_match["class_name"],
                "present",
                date.today().isoformat(),
                f"Auto-marked via face recognition (confidence: {best_match['confidence']:.2%})"
            )
            
            return jsonify({
                "message": "Face recognized and attendance marked",
                "matched": True,
                "best_match": best_match,
                "all_matches": matched_students,
                "attendance_marked": "error" not in att_result
            }), 200
        
        return jsonify({
            "message": "Face recognition complete",
            "matched": len(matched_students) > 0,
            "best_match": matched_students[0] if matched_students else None,
            "all_matches": matched_students
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Student Enrollments
# ========================================
@bp.route("/enrollments/<int:student_id>", methods=["GET"])
@jwt_required()
def get_enrollments(student_id):
    """Get all face enrollments for a student"""
    try:
        enrollments = get_student_embeddings(student_id)
        
        return jsonify({
            "student_id": student_id,
            "enrollments": enrollments,
            "total": len(enrollments)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Delete Face Enrollment
# ========================================
@bp.route("/enrollments/<int:embedding_id>", methods=["DELETE"])
@jwt_required()
def delete_face_enrollment(embedding_id):
    """Delete a specific face enrollment"""
    try:
        success = delete_embedding(embedding_id)
        
        if not success:
            return jsonify({"error": "Enrollment not found"}), 404
        
        return jsonify({
            "message": "Face enrollment deleted successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Enrollment Statistics
# ========================================
@bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    """Get face enrollment statistics"""
    try:
        stats = get_enrollment_stats()
        success_rate = get_recognition_success_rate(30)
        
        return jsonify({
            "enrollment_stats": stats,
            "recognition_stats": success_rate
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Get Students Needing Enrollment
# ========================================
@bp.route("/needing-enrollment", methods=["GET"])
@jwt_required()
def get_not_enrolled():
    """Get list of students who need face enrollment"""
    try:
        students = get_students_needing_enrollment()
        
        return jsonify({
            "students": students,
            "total": len(students)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Batch Recognize (For Class Photos)
# ========================================
@bp.route("/batch-recognize", methods=["POST"])
@jwt_required()
def batch_recognize():
    """
    Recognize multiple faces from a single image
    (Future enhancement for group photos)
    """
    try:
        return jsonify({
            "message": "Batch recognition not yet implemented",
            "status": "coming_soon"
        }), 501
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Health Check
# ========================================
@bp.route("/health", methods=["GET"])
def health_check():
    """Check if face recognition system is ready"""
    try:
        import face_recognition
        
        return jsonify({
            "status": "ready",
            "face_recognition_available": True,
            "message": "Face recognition system is operational"
        }), 200
    
    except ImportError:
        return jsonify({
            "status": "not_ready",
            "face_recognition_available": False,
            "message": "face_recognition library not installed. Run: pip install face_recognition"
        }), 503
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


# ========================================
# Automatic Attendance (Students & Teachers)
# ========================================
@bp.route("/mark-attendance-auto", methods=["POST"])
@jwt_required()
def mark_attendance_auto():
    """
    Automatic attendance marking for both students and teachers
    - Students: Mark student attendance automatically
    - Teachers: Mark teacher attendance automatically
    
    Request body:
    {
        "image": "base64_encoded_image",
        "user_type": "student" or "teacher",
        "student_id": 123 (if student),
        "teacher_id": 456 (if teacher),
        "tolerance": 0.6 (optional)
    }
    """
    try:
        data = request.get_json()
        image_data = data.get("image")
        user_type = data.get("user_type", "student").lower()  # "student" or "teacher"
        student_id = data.get("student_id")
        teacher_id = data.get("teacher_id")
        tolerance = float(data.get("tolerance", 0.6))
        
        if not image_data:
            return jsonify({"error": "Missing image data"}), 400
        
        if user_type not in ["student", "teacher"]:
            return jsonify({"error": "user_type must be 'student' or 'teacher'"}), 400
        
        # Process image and get embedding
        result = process_face_image(image_data)
        if "error" in result:
            return jsonify(result), 400
        
        unknown_embedding = result["embedding"]
        unknown_encoding_np = np.array(unknown_embedding).reshape(1, -1)
        
        # Get all enrolled embeddings
        all_embeddings = get_all_active_embeddings()
        
        if not all_embeddings:
            return jsonify({
                "message": "No enrolled faces in database",
                "matched": False,
                "attendance_marked": False
            }), 200
        
        # Extract encodings
        known_encodings = [np.array(emp["embedding"]) for emp in all_embeddings]
        
        # Compare faces
        matches = compare_faces(known_encodings, unknown_embedding, tolerance)
        
        if "error" in matches:
            return jsonify(matches), 400
        
        matched_data = []
        
        for match in matches["matches"]:
            embedding_info = all_embeddings[match["index"]]
            matched_data.append({
                "student_id": embedding_info["student_id"],
                "student_name": embedding_info["student_name"],
                "class_name": embedding_info["class_name"],
                "confidence": match["confidence"],
                "distance": match["distance"]
            })
            
            # Record recognition attempt
            record_recognition_attempt(
                embedding_info["student_id"],
                match["confidence"],
                matched=True
            )
        
        if not matched_data:
            return jsonify({
                "message": "No face match found",
                "matched": False,
                "attendance_marked": False
            }), 200
        
        best_match = matched_data[0]
        attendance_marked = False
        attendance_result = None
        
        # Mark attendance based on user type
        if user_type == "student":
            from smart_school_backend.models.student_attendance import mark_attendance as mark_student_att
            from datetime import date
            
            att_result = mark_student_att(
                best_match["student_id"],
                best_match["class_name"],
                "present",
                date.today().isoformat(),
                f"Auto-marked via face recognition (confidence: {best_match['confidence']:.2%})"
            )
            
            if "error" not in att_result:
                attendance_marked = True
                attendance_result = att_result
        
        elif user_type == "teacher":
            from smart_school_backend.models.teacher_attendance import add_teacher_attendance
            from datetime import datetime
            
            try:
                # For teachers, we need to identify which teacher this is
                # Get teacher by matching with enrolled student info
                # But teachers need their own face enrollment - for now, we'll mark based on student recognition
                # This is a workaround; ideally teachers should have separate enrollment
                
                add_teacher_attendance(
                    teacher_id or best_match["student_id"],
                    datetime.now().date().isoformat(),
                    "present",
                    datetime.now().isoformat()
                )
                attendance_marked = True
                attendance_result = {"status": "marked"}
            except Exception as e:
                attendance_result = {"error": str(e)}
        
        return jsonify({
            "message": "Face recognized and attendance processed",
            "matched": True,
            "best_match": best_match,
            "all_matches": matched_data,
            "user_type": user_type,
            "attendance_marked": attendance_marked,
            "attendance_result": attendance_result
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================================
# Enroll Teacher Face
# ========================================
@bp.route("/enroll-teacher", methods=["POST"])
@jwt_required()
def enroll_teacher_face():
    """Enroll a teacher's face for automatic attendance recognition"""
    try:
        data = request.get_json()
        teacher_id = data.get("teacher_id")
        image_data = data.get("image")
        teacher_name = data.get("teacher_name")
        notes = data.get("notes")
        
        if not teacher_id or not image_data:
            return jsonify({"error": "Missing teacher_id or image"}), 400
        
        # Process image and get embedding
        result = process_face_image(image_data)
        
        if "error" in result:
            return jsonify(result), 400
        
        embedding = result["embedding"]
        
        # Store embedding with teacher info
        store_result = store_face_embedding(
            teacher_id,
            teacher_name or f"Teacher {teacher_id}",
            "Teachers",  # Use "Teachers" as class_name for teachers
            embedding,
            notes or "Teacher face enrollment"
        )
        
        return jsonify({
            "message": "Teacher face enrolled successfully",
            "teacher_id": teacher_id,
            "enrollment": store_result
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
