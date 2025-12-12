# face_engine/encoder.py
import face_recognition
import numpy as np
import cv2
import base64
import io

def _b64_to_image(b64_string):
    """
    Accepts data URL or raw base64 string and returns BGR OpenCV image.
    """
    if b64_string.startswith("data:"):
        # data:image/png;base64,.....
        b64_string = b64_string.split(",")[1]

    binary = base64.b64decode(b64_string)
    arr = np.frombuffer(binary, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)  # BGR
    return img

def encode_image_base64(b64_string):
    """
    Convert base64 image to face embedding (128-d numpy array).
    Returns a list of embeddings (there may be multiple faces) — each embedding is a list of floats.
    """
    try:
        img_bgr = _b64_to_image(b64_string)
        # convert BGR to RGB for face_recognition
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        # detect face locations
        locations = face_recognition.face_locations(img_rgb, model="hog")  # hog is faster; you can change to "cnn" if available
        if len(locations) == 0:
            return []
        encodings = face_recognition.face_encodings(img_rgb, known_face_locations=locations)
        # convert to lists for JSON-serializable storage
        embeddings = [enc.tolist() for enc in encodings]
        return embeddings
    except Exception as e:
        raise

def compare_embeddings(embedding_a, embedding_b):
    """
    Compute euclidean distance between two embeddings (lists or numpy arrays).
    Smaller = more similar.
    """
    a = np.array(embedding_a)
    b = np.array(embedding_b)
    return float(np.linalg.norm(a - b))
