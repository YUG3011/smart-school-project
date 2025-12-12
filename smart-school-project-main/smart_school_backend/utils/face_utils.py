# smart_school_backend/utils/face_utils.py
from face_engine.encoder import compare_embeddings
import math

# default threshold for match (Euclidean distance). You can tune this value.
DEFAULT_MATCH_THRESHOLD = 0.55  # typical: 0.4 - 0.6; increase to be more permissive

def is_match(distance, threshold=DEFAULT_MATCH_THRESHOLD):
    return distance <= threshold

def find_best_match(target_embedding, stored_list):
    """
    stored_list: list of dicts with 'person_id','name','role','embedding'
    target_embedding: list
    Returns best_match dict with distance, or None if none available
    """
    if target_embedding is None:
        return None
    best = None
    for s in stored_list:
        if not s.get("embedding"):
            continue
        try:
            d = compare_embeddings(target_embedding, s["embedding"])
        except Exception:
            continue
        if best is None or d < best["distance"]:
            best = {
                "person_id": s["person_id"],
                "name": s["name"],
                "role": s["role"],
                "distance": d
            }
    return best
