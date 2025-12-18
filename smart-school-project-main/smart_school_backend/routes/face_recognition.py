# smart_school_backend/routes/face_recognition.py
# OLD ENROLLMENT/RECOGNITION ROUTES DISABLED – DO NOT USE
# These are kept ONLY so the backend doesn't crash if the old
# frontend accidentally sends requests.

from flask import Blueprint, jsonify

face_recognition_bp = Blueprint("face_recognition_bp", __name__)

# ---------------------------------------------------------------
# OLD: /api/face-recognition/recognize
# ---------------------------------------------------------------
@face_recognition_bp.route("/recognize", methods=["POST"])
def old_recognize_disabled():
    return jsonify({
        "error": "Old recognition API removed. Use /api/face/recognize instead."
    }), 410


# ---------------------------------------------------------------
# OLD: /api/face-recognition/enroll/student
# ---------------------------------------------------------------
@face_recognition_bp.route("/enroll/student", methods=["POST"])
def old_student_enroll_disabled():
    return jsonify({
        "error": "Old enrollment API removed. Use /api/face/enroll instead."
    }), 410


# ---------------------------------------------------------------
# OLD: /api/face-recognition/enroll/teacher
# ---------------------------------------------------------------
@face_recognition_bp.route("/enroll/teacher", methods=["POST"])
def old_teacher_enroll_disabled():
    return jsonify({
        "error": "Old enrollment API removed. Use /api/face/enroll instead."
    }), 410
