import { getProducts, formatProductsForAI } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, businessName, businessLang, businessRules } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const products = await getProducts();
  const productList = formatProductsForAI(products);

  const systemPrompt = `You are a customer service and sales agent for "${businessName || "this business"}".

LIVE PRODUCT LIST:
${productList}

EXTRA BUSINESS INFO:
${businessRules || ""}

LANGUAGE RULES:
- If customer writes Bangla script: reply in Bangla script
- If customer writes English: reply in English
- If customer writes Banglish: reply in proper Bangla script
- NEVER write Bangla words in English letters

PHOTO RULES:
- If customer asks for photo or ছবি, put URL on its own line exactly: PHOTO:https://...
- Only send photo if URL exists in product list
- If no photo: দুঃখিত, এই পণ্যের ছবি এখন নেই

STOCK RULES:
- If product is ❌ Out of stock, tell customer it is unavailable
- Suggest similar in-stock products if possible

ORDER COLLECTION RULES:
- When customer wants to buy, collect these one by one:
  1. Which product and quantity
  2. Full name
  3. Phone number
  4. Delivery address
- After collecting all 4, show a summary and ask for confirmation
- When showing summary, output a JSON block on its own line EXACTLY like this:
  ORDERDATA:{"product":"Silk Saree","quantity":"2","name":"Rahim","phone":"01712345678","address":"Mirpur Dhaka","total":"3000"}
- After buyer confirms with হ্যাঁ/yes/confirm, reply with: ORDER_CONFIRMED
- Then tell them you will contact them soon

YOUR JOB:
- Answer questions about products, prices, delivery
- Negotiate politely — never go below minimum price
- Be friendly and short (2-4 sentences)
- Never reveal you are an AI unless directly asked
- Guide interested buyers through the order process`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    // Handle rate limit
    if (response.status === 429) {
      return res.status(200).json({
        reply: "একটু ব্যস্ত আছি, ৩০ সেকেন্ড পর আবার চেষ্টা করুন। 🙏",
        orderData: null,
        isConfirmed: false,
      });
    }

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, no response.";

    // Flexible order data extraction
    let orderData = null;
    const orderMatch = reply.match(/ORDERDATA:\s*({[\s\S]+?})/);
    if (orderMatch) {
      try {
        orderData = JSON.parse(orderMatch[1]);
      } catch (e) {
        const product  = reply.match(/"product"\s*:\s*"([^"]+)"/)?.[1];
        const quantity = reply.match(/"quantity"\s*:\s*"([^"]+)"/)?.[1];
        const name     = reply.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
        const phone    = reply.match(/"phone"\s*:\s*"([^"]+)"/)?.[1];
        const address  = reply.match(/"address"\s*:\s*"([^"]+)"/)?.[1];
        const total    = reply.match(/"total"\s*:\s*"([^"]+)"/)?.[1];
        if (product && name && phone) {
          orderData = { product, quantity, name, phone, address, total };
        }
      }
    }

    const isConfirmed = reply.includes("ORDER_CONFIRMED");

    const cleanReply = reply
      .replace(/ORDERDATA:\s*{[\s\S]+?}/, "")
      .replace("ORDER_CONFIRMED", "")
      .trim();

    return res.status(200).json({ reply: cleanReply, orderData, isConfirmed });

  } catch (error) {
    return res.status(500).json({ error: "Failed to contact AI" });
  }
}