import { useState, useEffect, useRef } from "react";
import { generateCustomAnalysis } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const Chat = ({ fileId, fileName }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm your AI assistant for the document "${fileName}". How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input
    setInput("");

    // Set loading state
    setLoading(true);

    try {
      // Generate response
      const response = await generateCustomAnalysis(fileId, input);

      // Add assistant message
      const assistantMessage = {
        role: "assistant",
        content: response.customAnalysis,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);

      // Add error message
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // Clear loading state
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg border border-gray-200">
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary-custom text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block rounded-lg px-4 py-2 bg-white border border-gray-200">
              <LoadingSpinner size="sm" color="primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-custom"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-primary-custom text-white px-4 py-2 rounded-r-md hover:bg-primary-custom/90 transition-colors"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
