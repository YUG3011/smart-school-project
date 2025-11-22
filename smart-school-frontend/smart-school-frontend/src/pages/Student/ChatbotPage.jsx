import { useState, useRef, useEffect } from "react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your study assistant. How can I help you today?" },
  ]);

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const sendMessage = () => {
    if (!input.trim()) return;

    // User message
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    // Clear input
    setInput("");

    // Dummy bot response (backend later)
    setTimeout(() => {
      const botResponse = {
        sender: "bot",
        text: "Thanks for your question! (AI backend response will come here later.)",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Chatbot Assistant</h1>

      {/* CHAT WINDOW */}
      <div className="bg-white h-[70vh] p-4 rounded shadow flex flex-col">

        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg max-w-[70%] 
                ${msg.sender === "user" 
                  ? "bg-blue-500 text-white ml-auto" 
                  : "bg-gray-200 text-black"
                }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT BOX */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={sendMessage}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
