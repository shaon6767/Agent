import { useState, useRef } from "react";
import Head from "next/head";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

const DEFAULT_CONFIG = {
  name: "Dhaka Fashion House",
  lang: "Bangla + English mixed",
  rules: `I sell sarees and salwar kameez.
Saree price: 1500tk, minimum I can go: 1200tk.
Salwar kameez: 900tk, minimum: 750tk.
Free delivery above 2000tk. Below that: 60tk delivery charge.
Payment via bKash: 01700000000.
No returns after 3 days. Dhaka delivery 1-2 days, outside 3-5 days.`,
};

const INITIAL_MESSAGES = [
  { role: "system", content: "👋 Agent connected — try sending a message below" },
];

export default function Home() {
  const [config] = useState(DEFAULT_CONFIG);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [pendingOrder, setPendingOrder] = useState(null);
  const pendingOrderRef = useRef(null);

  const updatePendingOrder = (order) => {
    pendingOrderRef.current = order;
    setPendingOrder(order);
  };

  const handleSend = async (text) => {
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    const newHistory = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newHistory);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          businessName: config.name,
          businessLang: config.lang,
          businessRules: config.rules,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, {
          role: "system",
          content: "⚠️ দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        }]);
      } else {

        // Save order data whenever AI sends it
        if (data.orderData) {
          updatePendingOrder(data.orderData);
        }

        // Use ref to avoid stale state
        const orderToSave = data.orderData || pendingOrderRef.current;

        if (data.isConfirmed && orderToSave) {
          try {
            await fetch("/api/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderToSave),
            });

            const receipt = `✅ অর্ডার সফলভাবে নেওয়া হয়েছে!\n\n🛍 পণ্য: ${orderToSave.product}\n📦 পরিমাণ: ${orderToSave.quantity}\n👤 নাম: ${orderToSave.name}\n📞 ফোন: ${orderToSave.phone}\n📍 ঠিকানা: ${orderToSave.address}\n💰 মোট: ${orderToSave.total}tk\n\nআমরা শীঘ্রই যোগাযোগ করব। ধন্যবাদ! 🎉`;

            setMessages((prev) => [...prev, {
              role: "system",
              content: receipt,
            }]);

          } catch (err) { }
          updatePendingOrder(null);
        }

        const aiMsg = { role: "assistant", content: data.reply };
        setMessages((prev) => [...prev, aiMsg]);
        setChatHistory((prev) => [...prev, {
          role: "assistant",
          content: data.reply,
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "system",
        content: "⚠️ দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      }]);
    }

    setIsTyping(false);
  };

  return (
    <>
      <Head>
        <title>{config.name} — Customer Support</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main style={{
        position: "fixed",
        inset: 0,
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          maxWidth: "480px",
          maxHeight: "880px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          background: "#fff",
        }}>

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}>
            <div style={{
              width: "40px", height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>👩‍💼</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 700, fontSize: "14px",
                color: "#111827", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {config.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span style={{
                  width: "6px", height: "6px",
                  background: "#4ade80", borderRadius: "50%",
                  display: "inline-block", flexShrink: 0,
                }} />
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                  Online · Replies instantly
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setChatHistory([]);
                updatePendingOrder(null);
              }}
              title="Home"
              style={{
                width: "32px", height: "32px",
                borderRadius: "50%", background: "#f3f4f6",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                border: "none", cursor: "pointer",
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>

          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            config={config}
            onSuggestion={handleSend}
          />

          <MessageInput onSend={handleSend} disabled={isTyping} />

        </div>
      </main>
    </>
  );
}