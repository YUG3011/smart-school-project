"""
Real-Time Face Recognition and Tracking Endpoint
Processes video frames and returns face detection results with boxes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from smart_school_backend.utils.db import get_db
from datetime import datetime, date
import base64
import json
import numpy as np
from io import BytesIO
from PIL import Image
import face_recognition

bp = Blueprint("realtime_attendance", __name__, url_prefix="/api/realtime-attendance")


def process_frame_for_faces(image_data):
    """Process a single frame and return face locations with encodings"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image_array = np.array(image)
        
        # Get original dimensions for later scaling
        original_height, original_width = image_array.shape[:2]
        
        # Resize for faster processing (1/4 size like the original)
        small_height = original_height // 4
        small_width = original_width // 4
        small_image = np.array(Image.fromarray(image_array).resize((small_width, small_height)))
        
        # Convert to RGB if needed
        if len(small_image.shape) == 2:  # Grayscale
            small_image = np.stack([small_image] * 3, axis=-1)
        elif small_image.shape[2] == 4:  # RGBA
            small_image = small_image[:, :, :3]
        
        # Detect faces and encodings
        face_locations = face_recognition.face_locations(small_image, model="hog")
        face_encodings = face_recognition.face_encodings(small_image, face_locations)
        
        # Scale coordinates back to original size
        scaled_face_locations = []
        for (top, right, bottom, left) in face_locations:
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            scaled_face_locations.append((top, right, bottom, left))
        
        return {
            "success": True,
            "face_locations": scaled_face_locations,
            "face_encodings": [enc.tolist() for enc in face_encodings],
            "original_dimensions": {
                "height": original_height,
                "width": original_width
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_all_active_face_embeddings():
    """Get all active student and teacher face embeddings from database"""
    try:
        conn = get_db()
        
        # Get student embeddings
        c = conn.cursor()
        c.execute("""
            SELECT fe.id, fe.student_id, fe.embedding, s.name, 'student' as type
            FROM face_embeddings fe
            JOIN students s ON fe.student_id = s.id
            WHERE fe.is_active = 1
        """)
        
        embeddings = []
        for row in c.fetchall():
            embedding_data = json.loads(row[2])
            embeddings.append({
                'id': row[0],
                'entity_id': row[1],
                'embedding': embedding_data,
                'name': row[3],
                'type': row[4]
            })
        
        return embeddings
    
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        return []


def find_matching_face(captured_embedding, all_embeddings, tolerance=0.52):
    """Find best matching face from database"""
    if not all_embeddings:
        return None
    
    try:
        captured_embedding_np = np.array(captured_embedding)
        best_match = None
        best_distance = float('inf')
        
        for embedding_record in all_embeddings:
            stored_embedding = np.array(embedding_record['embedding'])
            
            # Calculate face distance
            distance = face_recognition.face_distance([stored_embedding], captured_embedding_np)[0]
            
            if distance < best_distance and distance <= tolerance:
                best_distance = distance
                best_match = {
                    'name': embedding_record['name'],
                    'entity_id': embedding_record['entity_id'],
                    'type': embedding_record['type'],
                    'distance': float(distance),
                    'confidence': float(1 - distance)
                }
        
        return best_match
    
    except Exception as e:
        print(f"Error finding match: {e}")
        return None


def check_already_marked_today(student_id):
    """Check if student already marked attendance today"""
    try:
        conn = get_db()
        c = conn.cursor()
        
        today = date.today().isoformat()
        c.execute("""
            SELECT id FROM student_attendance 
            WHERE student_id = ? AND date(date) = ?
        """, (student_id, today))
        
        result = c.fetchone()
        return result is not None
    except:
        return False


def mark_attendance_record(student_id, status="present"):
    """Mark attendance in database"""
    try:
        conn = get_db()
        c = conn.cursor()
        
        c.execute("""
            INSERT INTO student_attendance (student_id, date, status)
            VALUES (?, ?, ?)
        """, (student_id, datetime.now(), status))
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error marking attendance: {e}")
        return False


@bp.route("/process-frame", methods=["POST"])
def process_frame():
    """
    Process a video frame and return face detection results
    
    Request:
    {
        "frame": "base64_encoded_image",
        "tolerance": 0.52  (optional)
    }
    
    Response:
    {
        "success": true,
        "faces": [
            {
                "box": [top, right, bottom, left],
                "name": "John Doe",
                "color": "green",  // green for matched, red for unknown
                "confidence": 0.95,
                "marked": true/false
            }
        ]
    }
    """
    try:
        data = request.get_json()
        print(f"[REALTIME] Received frame data: {data is not None}, keys: {data.keys() if data else 'None'}")
        frame_data = data.get("frame")
        tolerance = float(data.get("tolerance", 0.52))
        
        if not frame_data:
            return jsonify({"error": "No frame data provided"}), 400
        
        # Process the frame to detect faces
        frame_result = process_frame_for_faces(frame_data)
        if not frame_result["success"]:
            return jsonify(frame_result), 400
        
        face_locations = frame_result["face_locations"]
        face_encodings = frame_result["face_encodings"]
        
        # Get all known embeddings
        all_embeddings = get_all_active_face_embeddings()
        
        # Process each detected face
        faces = []
        for face_box, face_encoding in zip(face_locations, face_encodings):
            match = find_matching_face(face_encoding, all_embeddings, tolerance)
            
            if match:
                # Face recognized
                name = match['name']
                color = "green"
                
                # Check if already marked and mark if not
                already_marked = check_already_marked_today(match['entity_id'])
                marked_now = False
                
                if not already_marked:
                    marked_now = mark_attendance_record(match['entity_id'])
                
                faces.append({
                    "box": face_box,
                    "name": name,
                    "color": color,
                    "confidence": match['confidence'],
                    "marked": marked_now or already_marked,
                    "already_marked": already_marked
                })
            else:
                # Unknown face
                faces.append({
                    "box": face_box,
                    "name": "Unknown",
                    "color": "red",
                    "confidence": 0.0,
                    "marked": False,
                    "already_marked": False
                })
        
        return jsonify({
            "success": True,
            "faces": faces,
            "frame_dimensions": frame_result["original_dimensions"]
        }), 200
    
    except Exception as e:
        print(f"Error in process_frame: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    embeddings = get_all_active_face_embeddings()
    return jsonify({
        "status": "ok",
        "enrolled_faces": len(embeddings)
    }), 200
