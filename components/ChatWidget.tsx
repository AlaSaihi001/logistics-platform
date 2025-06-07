"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[350px] h-[450px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">Chat Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          {/* Chat body */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto text-sm flex flex-col">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-100 self-end ml-auto text-right"
                    : "bg-gray-100 self-start mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 self-start mr-auto">
                <span className="animate-bounce [animation-delay:0ms] w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="animate-bounce [animation-delay:150ms] w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="animate-bounce [animation-delay:300ms] w-2 h-2 bg-gray-400 rounded-full"></span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-gray-50 flex items-center gap-2">
            <TextareaAutosize
              minRows={1}
              maxRows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="Type your message..."
              className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm shadow-md transition-all duration-200"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
