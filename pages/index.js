import { useState, useEffect } from "react";
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
        if (data.orderData) setPendingOrder(data.orderData);

        if (data.isConfirmed && pendingOrder) {
          try {
            await fetch("/api/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pendingOrder),
            });
          } catch (err) {}
          setPendingOrder(null);
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

      {/* Gray background visible top and bottom as gap */}
      <main className="min-h-screen bg-gray-200 flex items-center justify-center py-4 px-4">
        <div className="w-full h-full md:max-w-lg flex flex-col overflow-hidden bg-white rounded-3xl shadow-2xl"
          style={{ height: "calc(100vh - 32px)", maxHeight: "880px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-lg shrink-0">
              👩‍💼
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                {config.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full status-pulse shrink-0" />
                <span className="text-xs text-gray-400">Online · Replies instantly</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
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