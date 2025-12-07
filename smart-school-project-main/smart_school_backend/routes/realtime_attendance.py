"""
Real-Time Face Recognition Attendance System
Uses face_recognition library with database embeddings
Similar to the working attendance_recognition.py model
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, date
import base64
import json
import numpy as np
from io import BytesIO
from PIL import Image
import face_recognition
import sqlite3

bp = Blueprint("realtime_attendance", __name__, url_prefix="/api/realtime-attendance")

# Global cache for embeddings
_embedding_cache = None
_cache_timestamp = None


def load_embeddings_from_db():
    """Load all face embeddings from database"""
    global _embedding_cache, _cache_timestamp
    
    try:
        conn = sqlite3.connect('school.db')
        cursor = conn.cursor()
        
        # Get all active student embeddings
        cursor.execute("""
            SELECT fe.id, fe.student_id, fe.embedding, s.name
            FROM face_embeddings fe
            JOIN students s ON fe.student_id = s.id
            WHERE fe.is_active = 1
        """)
        
        embeddings = []
        for row in cursor.fetchall():
            embed_id, student_id, embedding_json, name = row
            try:
                embedding_array = np.array(json.loads(embedding_json))
                embeddings.append({
                    'id': embed_id,
                    'student_id': student_id,
                    'name': name,
                    'embedding': embedding_array
                })
            except Exception as e:
                print(f"Error parsing embedding {embed_id}: {e}")
                continue
        
        conn.close()
        _embedding_cache = embeddings
        _cache_timestamp = datetime.now()
        print(f"[REALTIME] Loaded {len(embeddings)} embeddings from database")
        return embeddings
    
    except Exception as e:
        print(f"[ERROR] Failed to load embeddings: {e}")
        return []


def get_cached_embeddings():
    """Get embeddings with caching (reload every 5 minutes)"""
    global _embedding_cache, _cache_timestamp
    
    if _embedding_cache is None:
        return load_embeddings_from_db()
    
    # Reload if cache is older than 5 minutes
    if (datetime.now() - _cache_timestamp).total_seconds() > 300:
        return load_embeddings_from_db()
    
    return _embedding_cache


def check_already_marked_today(student_id):
    """Check if student already marked attendance today"""
    try:
        conn = sqlite3.connect('school.db')
        cursor = conn.cursor()
        today = date.today().isoformat()
        
        cursor.execute("""
            SELECT COUNT(*) FROM student_attendance
            WHERE student_id = ? AND DATE(attendance_date) = ?
        """, (student_id, today))
        
        result = cursor.fetchone()[0]
        conn.close()
        return result > 0
    except Exception as e:
        print(f"Error checking attendance: {e}")
        return False


def mark_attendance(student_id):
    """Mark attendance in database"""
    try:
        conn = sqlite3.connect('school.db')
        cursor = conn.cursor()
        now = datetime.now()
        
        # Check if already marked today
        if check_already_marked_today(student_id):
            return False  # Already marked
        
        # Insert attendance record
        cursor.execute("""
            INSERT INTO student_attendance 
            (student_id, attendance_date, time_in, status)
            VALUES (?, ?, ?, 'present')
        """, (student_id, now.date().isoformat(), now.time().isoformat()))
        
        conn.commit()
        conn.close()
        print(f"[ATTENDANCE] Marked student {student_id} at {now}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to mark attendance: {e}")
        return False


@bp.route("/process-frame", methods=["POST"])
def process_frame():
    """
    Process a video frame and detect faces with recognition
    Returns face boxes with names and colors
    """
    try:
        data = request.get_json()
        if not data or 'frame' not in data:
            return jsonify({"error": "No frame data"}), 400
        
        frame_data = data.get('frame')
        tolerance = float(data.get('tolerance', 0.52))
        
        print(f"[REALTIME] Processing frame, tolerance: {tolerance}")
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(frame_data)
            image = Image.open(BytesIO(image_bytes))
            frame_array = np.array(image)
        except Exception as e:
            print(f"[ERROR] Failed to decode image: {e}")
            return jsonify({"error": "Failed to decode frame"}), 400
        
        # Get dimensions
        height, width = frame_array.shape[:2]
        
        # Detect faces in FULL SIZE first (resizing loses face data)
        # Don't resize before detection - HOG needs minimum face size
        print(f"[REALTIME] Frame size: {width}x{height}")
        face_locations = face_recognition.face_locations(frame_array, model="hog")
        face_encodings = face_recognition.face_encodings(frame_array, face_locations)
        
        print(f"[REALTIME] Detected {len(face_locations)} faces")
        
        # Get known embeddings
        known_embeddings = get_cached_embeddings()
        if not known_embeddings:
            print("[REALTIME] No known embeddings loaded!")
            return jsonify({
                "success": True,
                "faces": [],
                "frame_dimensions": {"width": width, "height": height}
            }), 200
        
        # Process each detected face
        results = []
        for face_location, face_encoding in zip(face_locations, face_encodings):
            # Get face coordinates (no scaling needed since we use full-size image)
            top, right, bottom, left = face_location
            
            # Compare with known faces
            face_distances = face_recognition.face_distance(
                [e['embedding'] for e in known_embeddings],
                face_encoding
            )
            
            best_match_idx = np.argmin(face_distances)
            best_distance = face_distances[best_match_idx]
            
            print(f"[REALTIME] Best match distance: {best_distance:.4f}, tolerance: {tolerance}")
            
            if best_distance < tolerance:
                # MATCH FOUND
                matched_student = known_embeddings[best_match_idx]
                student_id = matched_student['student_id']
                name = matched_student['name']
                color = "green"
                
                # Try to mark attendance
                marked = mark_attendance(student_id)
                
                results.append({
                    "box": [top, right, bottom, left],
                    "name": name,
                    "color": color,
                    "confidence": float(1.0 - best_distance),
                    "marked": marked,
                    "student_id": student_id
                })
                
                print(f"[REALTIME] [MATCH] {name} (distance: {best_distance:.4f})")
            else:
                # NO MATCH - UNKNOWN FACE
                results.append({
                    "box": [top, right, bottom, left],
                    "name": "Unknown",
                    "color": "red",
                    "confidence": float(1.0 - best_distance),
                    "marked": False,
                    "student_id": None
                })
                
                print(f"[REALTIME] [UNKNOWN] Best distance {best_distance:.4f} exceeds tolerance {tolerance}")
        
        return jsonify({
            "success": True,
            "faces": results,
            "frame_dimensions": {"width": width, "height": height},
            "total_faces": len(results)
        }), 200
    
    except Exception as e:
        print(f"[ERROR] Exception in process_frame: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    embeddings = get_cached_embeddings()
    return jsonify({
        "status": "ok",
        "enrolled_faces": len(embeddings),
        "embeddings": [
            {"id": e['id'], "name": e['name'], "student_id": e['student_id']}
            for e in embeddings
        ]
    }), 200
