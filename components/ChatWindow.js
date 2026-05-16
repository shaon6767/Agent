import { useEffect, useRef } from "react";

function WelcomeScreen({ config, products, onSuggestion }) {
  return (
    <div className="flex flex-col h-full items-center overflow-y-auto chat-scroll">

      <div className="px-8 pt-6 pb-4 border-b border-gray-100 text-center">
        <p className="text-[28px] font-semibold text-gray-800">
         <span className="text-[38px]">Welcome</span> <br/> How Can I Help You Today?
        </p>
      </div>

      <div className="max-w-140 w-full mx-auto justify-center items-center px-6 py-5 flex flex-col gap-5">

        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            <span className="font-bold text-gray-900">{config?.name || "We"}</span> offers{" "}
            {products && products.length > 0
              ? products.map((p, i) => (
                  <span key={i}>
                    <span className="text-indigo-600 font-medium">{p.product}</span>
                    {i < products.length - 1 ? ", " : ""}
                  </span>
                ))
              : "a variety of products"
            }. Ask me anything about prices, availability, product details or you can place an order! We have premium jersey's for all sizes right now. Check out any jersey you like.
          </p>

          {products && products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {products.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5"
                >
                  <span className="text-xs font-semibold text-gray-700">{p.product}</span>
                  <span className="text-xs font-bold text-indigo-600">{p.price}tk</span>
                  <span className={`text-xs font-semibold rounded-full px-1.5 py-0.5
                    ${p.stock?.toUpperCase() === "YES"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                    }`}>
                    {p.stock?.toUpperCase() === "YES" ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 leading-relaxed px-4">
          For order, give us your information. Just ask about any product and it will give you anything you need to know.
        </p>

        <p className="text-xs text-center text-gray-400 animate-bounce">
          নিচে লিখুন বা একটি প্রশ্ন বেছে নিন ↓
        </p>

        <div className="flex flex-wrap gap-2 justify-center px-4">
          {[
            "অর্ডার কিভাবে দিব?",
            "ছবি আছে?",
            "ডেলিভারি চার্জ কত?",
            "পেমেন্ট কিভাবে করব?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => onSuggestion(q)}
              className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-4 py-2 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-sm shrink-0">
        👩‍💼
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <div className="typing-dot" />
          <div className="typing-dot" style={{ animationDelay: "150ms" }} />
          <div className="typing-dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }) {
  const lines = content.split("\n");
  const fullText = content;

  if (fullText.includes("ORDER_SUMMARY:")) {
    const match = fullText.match(
      /ORDER_SUMMARY:\s*\nProduct:\s*(.+)\nQuantity:\s*(.+)\nName:\s*(.+)\nPhone:\s*(.+)\nAddress:\s*(.+)\nTotal:\s*(.+)/
    );
    const beforeSummary = fullText.split("ORDER_SUMMARY:")[0].trim();

    return (
      <div className="flex flex-col gap-3">
        {beforeSummary && <span>{beforeSummary}</span>}
        {match && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col gap-2 text-xs">
            <p className="font-bold text-indigo-700 text-sm mb-1">🛒 Order Summary</p>
            {[
              { label: "Product",  value: match[1] },
              { label: "Quantity", value: match[2] },
              { label: "Name",     value: match[3] },
              { label: "Phone",    value: match[4] },
              { label: "Address",  value: match[5] },
              { label: "Total",    value: match[6] + "tk" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between gap-2">
                <span className="text-gray-500 font-medium">{item.label}</span>
                <span className="text-gray-800 font-semibold text-right">{item.value}</span>
              </div>
            ))}
            <p className="text-indigo-600 font-medium mt-1 text-center">
              confirm করতে হ্যাঁ লিখুন ✅
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const photoMatch = trimmed.match(/PH[OT]{1,2}O?:\s*(https?:\/\/\S+)/i);
        if (photoMatch) {
          return (
            <img
              key={i}
              src={photoMatch[1].trim()}
              alt="Product photo"
              className="rounded-xl max-w-full max-h-60 object-cover border border-gray-100 shadow-sm mt-1"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          );
        }

        if (trimmed.startsWith("http") && trimmed.includes("cloudinary")) {
          return (
            <img
              key={i}
              src={trimmed}
              alt="Product photo"
              className="rounded-xl max-w-full max-h-60 object-cover border border-gray-100 shadow-sm mt-1"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          );
        }

        return <span key={i}>{trimmed}</span>;
      })}
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === "system") {
    return (
      <div className="flex justify-center my-1 mb-3">
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-4 py-1">
          {msg.content}
        </span>
      </div>
    );
  }

  const isUser = msg.role === "user";

  return (
    <div className={`flex items-end gap-3 mb-4 ${isUser ? "flex-row-reverse pl-12" : "flex-row pr-12"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0
        ${isUser ? "bg-gray-200" : "bg-gradient-to-br from-indigo-600 to-violet-600"}`}>
        {isUser ? "👤" : "👩‍💼"}
      </div>
      <div className={`px-4 py-3 text-sm leading-relaxed break-words rounded-2xl
        ${isUser
          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm shadow-md"
          : "bg-transparent text-gray-800 rounded-bl-sm"
        }`}>
        <MessageContent content={msg.content} />
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isTyping, config, products, onSuggestion }) {
  const bottomRef = useRef(null);
  const realMessages = messages.filter((m) => m.role !== "system");
  const isEmpty = realMessages.length === 0 && !isTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      {isEmpty ? (
        <WelcomeScreen config={config} products={products} onSuggestion={onSuggestion} />
      ) : (
        <div className="flex-1 overflow-y-auto chat-scroll px-6 pt-5 pb-2">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}