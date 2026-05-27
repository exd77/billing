// Vercel serverless function — returns mock LIVE/DEAD data for testing
// Format matches chkr.cc API response structure

const BANKS = [
  "Wells Fargo Bank",
  "Citibank NA",
  "PNC Bank",
  "Capital One NA",
  "US Bank National Association",
  "Chase Bank",
  "Bank of America NA",
  "The Bancorp Bank National Association",
];

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { data } = req.body || {};
  if (!data) {
    res.status(400).json({ error: "Missing data field" });
    return;
  }

  // Simulate delay
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 500));

  // 40% chance LIVE (matches server.py weights)
  const code = [0, 0, 1, 1, 0, 1, 0, 0, 1, 0][Math.floor(Math.random() * 10)];
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];

  const result = {
    code,
    status: code === 1 ? "Live" : "Die",
    message: code === 1 ? "Approved" : "Declined",
    card: {
      card: data,
      bank,
      type: "mastercard",
      category: Math.random() > 0.3 ? "credit" : "debit",
      country: {
        name: "United States",
        emoji: "🇺🇸",
      },
    },
  };

  res.status(200).json(result);
};
