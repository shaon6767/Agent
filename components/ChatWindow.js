import { useEffect, useRef } from "react";

function WelcomeScreen({ config, onSuggestion }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "16px",
      gap: "12px",
      overflow: "hidden",
    }}>

      {/* Welcome card */}
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #f0f0f0",
        padding: "16px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}>
        <p style={{
          fontSize: "13px", fontWeight: 600,
          color: "#6b7280", textAlign: "center",
          marginBottom: "8px",
        }}>
          Welcome, how can I help you today?
        </p>
        <p style={{
          fontSize: "13px", color: "#4b5563",
          lineHeight: 1.6, textAlign: "center", margin: 0,
        }}>
          আমরা <strong style={{ color: "#111827" }}>{config?.name || "এই শপ"}</strong> থেকে আপনাকে স্বাগত জানাই। যেকোনো প্রশ্ন করুন বা অর্ডার দিন।
        </p>
      </div>

      {/* Hint */}
      <p style={{
        fontSize: "11px", color: "#9ca3af",
        textAlign: "center", margin: 0,
      }}>
        নিচে লিখুন বা একটি প্রশ্ন বেছে নিন ↓
      </p>

      {/* Suggestion chips — 2 col */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
      }}>
        {[
          "কি কি পণ্য আছে?",
          "ছবি আছে?",
          "অর্ডার কিভাবে দিব?",
          "ডেলিভারি চার্জ কত?",
          "পেমেন্ট কিভাবে করব?",
          "দাম কমবে?",
        ].map((q) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            style={{
              fontSize: "12px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              color: "#4b5563",
              borderRadius: "12px",
              padding: "10px 12px",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {q}
          </button>
        ))}
      </div>

    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "12px", flexShrink: 0,
      }}>👩‍💼</div>
      <div style={{
        background: "#fff", border: "1px solid #f0f0f0",
        borderRadius: "16px", borderBottomLeftRadius: "4px",
        padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {beforeSummary && <span>{beforeSummary}</span>}
        {match && (
          <div style={{
            background: "#eef2ff", border: "1px solid #c7d2fe",
            borderRadius: "12px", padding: "12px",
          }}>
            <p style={{ fontWeight: 700, color: "#4338ca", fontSize: "13px", marginBottom: "8px" }}>
              🛒 Order Summary
            </p>
            {[
              { label: "Product",  value: match[1] },
              { label: "Quantity", value: match[2] },
              { label: "Name",     value: match[3] },
              { label: "Phone",    value: match[4] },
              { label: "Address",  value: match[5] },
              { label: "Total",    value: match[6] + "tk" },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between",
                gap: "8px", marginBottom: "4px", fontSize: "12px",
              }}>
                <span style={{ color: "#6b7280" }}>{item.label}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
            <p style={{
              color: "#4f46e5", fontWeight: 500,
              textAlign: "center", marginTop: "8px", fontSize: "12px",
            }}>
              confirm করতে হ্যাঁ লিখুন ✅
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
              style={{
                borderRadius: "12px", width: "100%",
                maxHeight: "200px", objectFit: "cover",
                border: "1px solid #f0f0f0", marginTop: "4px",
              }}
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
              style={{
                borderRadius: "12px", width: "100%",
                maxHeight: "200px", objectFit: "cover",
                border: "1px solid #f0f0f0", marginTop: "4px",
              }}
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
      <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 12px" }}>
        <span style={{
          fontSize: "11px", color: "#9ca3af",
          background: "#f3f4f6", borderRadius: "20px",
          padding: "3px 12px",
        }}>
          {msg.content}
        </span>
      </div>
    );
  }

  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "center",
      gap: "8px",
      marginBottom: "14px",
      paddingLeft: isUser ? "40px" : "0",
      paddingRight: isUser ? "0" : "40px",
    }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: isUser
          ? "#e0e7ff"
          : "linear-gradient(135deg, #4f46e5, #7c3aed)",
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "12px", flexShrink: 0,
      }}>
        {isUser ? "👤" : "👩‍💼"}
      </div>
      <div style={{
        fontSize: "14px",
        lineHeight: 1.6,
        wordBreak: "break-word",
        color: isUser ? "#4f46e5" : "#1f2937",
        fontWeight: isUser ? 500 : 400,
      }}>
        <MessageContent content={msg.content} />
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isTyping, config, onSuggestion }) {
  const bottomRef = useRef(null);
  const realMessages = messages.filter((m) => m.role !== "system");
  const isEmpty = realMessages.length === 0 && !isTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      background: "#f9fafb",
      overflow: "hidden",
    }}>
      {isEmpty ? (
        <WelcomeScreen config={config} onSuggestion={onSuggestion} />
      ) : (
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
        }}
          className="chat-scroll"
        >
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}