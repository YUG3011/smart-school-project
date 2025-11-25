// src/pages/Chatbot/ChatbotPage.jsx
import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ChatbotPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your Smart School AI Assistant. How can I help you today?" },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send request to backend API
      const res = await API.post("/chatbot", {
        message: input,
        role: user.role, // optional
      });

      const botMessage = {
        sender: "bot",
        text: res.data.reply,
      };

      // Add bot response
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠ Oops! I'm having trouble responding right now.",
        },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  // -----------------------------
  // UI RENDER
  // -----------------------------
  return (
    <div className="p-6 flex flex-col h-[80vh]">
      <h2 className="text-2xl font-semibold mb-4">AI Chat Assistant</h2>

      {/* CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded shadow space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded max-w-[70%] ${
              msg.sender === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-200 text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="mr-auto bg-gray-200 p-3 rounded w-24 animate-pulse">
            Typing...
          </div>
        )}
      </div>

      {/* INPUT BOX */}
      <form onSubmit={sendMessage} className="mt-4 flex gap-3">
        <input
          type="text"
          className="flex-1 border p-3 rounded"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
