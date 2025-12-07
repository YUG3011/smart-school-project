# routes/chatbot.py
from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")

    # Temporary AI response
    reply = f"You said: {message}. This is a response from the Smart School AI chatbot."

    return jsonify({"reply": reply})
