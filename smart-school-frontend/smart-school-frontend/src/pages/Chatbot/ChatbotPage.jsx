import { useState, useRef, useEffect } from "react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your Smart School Assistant 😊" },
  ]);

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const newMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);

    // Bot response (dummy for now)
    setTimeout(() => {
      const botReply = { sender: "bot", text: "I will answer this soon! 😊" };
      setMessages((prev) => [...prev, botReply]);
    }, 700);

    setInput("");
  };

  return (
    <div className="p-6 flex flex-col h-[80vh]">

      <h1 className="text-2xl font-semibold mb-4">Chat with AI Assistant</h1>

      {/* Chat Box */}
      <div className="flex-1 bg-white shadow rounded p-4 overflow-y-auto">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input Area */}
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border p-3 rounded-l"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-r"
        >
          Send
        </button>
      </div>

    </div>
  );
}
