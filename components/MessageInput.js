import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-4 shrink-0">
      <div className="flex items-center gap-3">
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={disabled}
          placeholder="Write something..."
          style={{ height: "52px" }}
          className="flex-1 border border-gray-200 rounded-full px-6 text-base bg-gray-50 text-gray-800 focus:outline-none focus:border-indigo-400 disabled:opacity-60 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          style={{ width: "52px", height: "52px" }}
          className={`rounded-full flex items-center justify-center shrink-0 transition-all duration-200
            ${disabled || !text.trim()
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:opacity-90 cursor-pointer"
            }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}