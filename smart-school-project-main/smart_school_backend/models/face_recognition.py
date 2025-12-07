"""
Face Recognition Model
Handles face encodings and recognition operations
"""

import json
from datetime import datetime
from smart_school_backend.utils.db import get_db


def create_face_embeddings_table():
    """Create face_embeddings table for storing face data"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            embedding TEXT NOT NULL,
            image_path TEXT,
            captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            confidence_score REAL,
            is_active BOOLEAN DEFAULT 1,
            notes TEXT,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    """)
    
    # Create index for fast lookups
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_face_student 
        ON face_embeddings(student_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_face_active 
        ON face_embeddings(is_active)
    """)
    
    db.commit()


def store_face_embedding(student_id, embedding, image_path=None, confidence=None, notes=None):
    """
    Store a face embedding for a student
    
    Args:
        student_id: Student ID
        embedding: Face encoding (list of 128 float values)
        image_path: Path to stored image
        confidence: Confidence score (0-1)
        notes: Additional notes
    
    Returns:
        dict with record or error
    """
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Verify student exists
        cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
        if cursor.fetchone() is None:
            return {"error": "Student not found"}
        
        # Convert embedding to JSON string
        embedding_json = json.dumps(embedding)
        
        # Insert new embedding
        cursor.execute("""
            INSERT INTO face_embeddings 
            (student_id, embedding, image_path, confidence_score, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (student_id, embedding_json, image_path, confidence, notes))
        
        db.commit()
        record_id = cursor.lastrowid
        
        # Retrieve stored record
        cursor.execute("""
            SELECT id, student_id, captured_at, confidence_score 
            FROM face_embeddings WHERE id = ?
        """, (record_id,))
        
        row = cursor.fetchone()
        return dict(row) if row else {"error": "Failed to store embedding"}
    
    except Exception as e:
        return {"error": str(e)}


def get_all_active_embeddings():
    """
    Get all active face embeddings for recognition
    
    Returns:
        List of embeddings with student data
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT fe.id, fe.student_id, fe.embedding, fe.confidence_score,
               s.name as student_name, s.class_name
        FROM face_embeddings fe
        JOIN students s ON fe.student_id = s.id
        WHERE fe.is_active = 1
    """)
    
    results = []
    for row in cursor.fetchall():
        row_dict = dict(row)
        # Parse embedding JSON
        row_dict['embedding'] = json.loads(row_dict['embedding'])
        results.append(row_dict)
    
    return results


def get_student_embeddings(student_id):
    """
    Get all embeddings for a specific student
    
    Args:
        student_id: Student ID
    
    Returns:
        List of embeddings
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT id, student_id, captured_at, confidence_score, is_active, notes
        FROM face_embeddings
        WHERE student_id = ?
        ORDER BY captured_at DESC
    """, (student_id,))
    
    results = []
    for row in cursor.fetchall():
        row_dict = dict(row)
        results.append(row_dict)
    
    return results


def get_embedding_by_id(embedding_id):
    """Get a specific embedding by ID"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT fe.id, fe.student_id, fe.embedding, fe.confidence_score,
               s.name as student_name, s.class_name, fe.captured_at
        FROM face_embeddings fe
        JOIN students s ON fe.student_id = s.id
        WHERE fe.id = ?
    """, (embedding_id,))
    
    row = cursor.fetchone()
    if row:
        row_dict = dict(row)
        row_dict['embedding'] = json.loads(row_dict['embedding'])
        return row_dict
    
    return None


def update_embedding_confidence(embedding_id, confidence):
    """Update confidence score for an embedding"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        UPDATE face_embeddings 
        SET confidence_score = ?
        WHERE id = ?
    """, (confidence, embedding_id))
    
    db.commit()
    return cursor.rowcount > 0


def deactivate_student_embeddings(student_id):
    """
    Deactivate all embeddings for a student (for re-enrollment)
    
    Args:
        student_id: Student ID
    
    Returns:
        Boolean indicating success
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        UPDATE face_embeddings 
        SET is_active = 0
        WHERE student_id = ?
    """, (student_id,))
    
    db.commit()
    return cursor.rowcount > 0


def delete_embedding(embedding_id):
    """Delete a specific embedding"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM face_embeddings WHERE id = ?", (embedding_id,))
    db.commit()
    
    return cursor.rowcount > 0


def get_enrollment_stats():
    """Get statistics on face enrollment"""
    db = get_db()
    cursor = db.cursor()
    
    # Total students with face data
    cursor.execute("""
        SELECT COUNT(DISTINCT student_id) as enrolled_students
        FROM face_embeddings
        WHERE is_active = 1
    """)
    enrolled = cursor.fetchone()[0]
    
    # Total embeddings
    cursor.execute("""
        SELECT COUNT(*) as total_embeddings
        FROM face_embeddings
        WHERE is_active = 1
    """)
    total_embeddings = cursor.fetchone()[0]
    
    # Total students in system
    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]
    
    # Enrollment percentage
    enrollment_pct = (enrolled / total_students * 100) if total_students > 0 else 0
    
    return {
        "enrolled_students": enrolled,
        "total_embeddings": total_embeddings,
        "total_students": total_students,
        "enrollment_percentage": round(enrollment_pct, 2)
    }


def record_recognition_attempt(student_id, confidence, matched=True, notes=None):
    """
    Record a face recognition attempt (for logging/analytics)
    
    Args:
        student_id: Student ID
        confidence: Match confidence (0-1)
        matched: Whether it was a successful match
        notes: Additional notes
    
    Returns:
        Record ID or error
    """
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recognition_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                confidence REAL,
                matched BOOLEAN,
                attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY(student_id) REFERENCES students(id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO recognition_attempts 
            (student_id, confidence, matched, notes)
            VALUES (?, ?, ?, ?)
        """, (student_id, confidence, matched, notes))
        
        db.commit()
        return cursor.lastrowid
    
    except Exception as e:
        return {"error": str(e)}


def get_recognition_success_rate(days=30):
    """
    Get face recognition success rate for recent attempts
    
    Args:
        days: Number of days to look back
    
    Returns:
        dict with success rate stats
    """
    db = get_db()
    cursor = db.cursor()
    
    from datetime import datetime, timedelta
    
    start_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    # Total attempts
    cursor.execute("""
        SELECT COUNT(*) as total_attempts
        FROM recognition_attempts
        WHERE attempted_at >= ?
    """, (start_date,))
    
    total = cursor.fetchone()[0]
    
    # Successful attempts
    cursor.execute("""
        SELECT COUNT(*) as successful_attempts
        FROM recognition_attempts
        WHERE attempted_at >= ? AND matched = 1
    """, (start_date,))
    
    successful = cursor.fetchone()[0]
    
    # Failed attempts
    cursor.execute("""
        SELECT COUNT(*) as failed_attempts
        FROM recognition_attempts
        WHERE attempted_at >= ? AND matched = 0
    """, (start_date,))
    
    failed = cursor.fetchone()[0]
    
    success_rate = (successful / total * 100) if total > 0 else 0
    
    return {
        "total_attempts": total,
        "successful": successful,
        "failed": failed,
        "success_rate_percentage": round(success_rate, 2),
        "days_analyzed": days
    }


def get_students_needing_enrollment():
    """
    Get list of students who haven't been enrolled in face recognition
    
    Returns:
        List of students without active face embeddings
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT s.id, s.name, s.email, s.class_name
        FROM students s
        WHERE s.id NOT IN (
            SELECT DISTINCT student_id 
            FROM face_embeddings 
            WHERE is_active = 1
        )
        ORDER BY s.class_name, s.name
    """)
    
    return [dict(row) for row in cursor.fetchall()]
