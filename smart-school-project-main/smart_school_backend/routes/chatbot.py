# routes/chatbot.py
from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")

    reply = f"You said: {message}. This is Smart School AI reply."

    return jsonify({"reply": reply})
