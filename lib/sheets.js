export async function getProducts() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!sheetId || !apiKey) return [];

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values || data.values.length < 2) return [];

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row) => ({
      product:  row[headers.indexOf("Product")]  || "",
      price:    row[headers.indexOf("Price")]    || "",
      minPrice: row[headers.indexOf("MinPrice")] || "",
      stock:    row[headers.indexOf("Stock")]    || "YES",
      photo:    row[headers.indexOf("Photo")]    || "",
    }));
  } catch (err) {
    return [];
  }
}

export function formatProductsForAI(products) {
  if (!products.length) return "No products found.";

  return products.map((p) => {
    return `${p.product}:${p.price}tk,min:${p.minPrice}tk,${p.stock?.toUpperCase() === "YES" ? "instock" : "outofstock"}${p.photo ? ",photo:" + p.photo : ""}`;
  }).join("\n");
}

export async function saveOrder(orderData) {
  const webhookUrl = process.env.ORDERS_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    return false;
  }
}