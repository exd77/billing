// Vercel serverless function — returns mock LIVE/DEAD data for testing
const BANKS = [
  { bank: "Wells Fargo Bank", country: "US", countryName: "United States" },
  { bank: "Citibank NA", country: "US", countryName: "United States" },
  { bank: "PNC Bank", country: "US", countryName: "United States" },
  { bank: "Capital One NA", country: "US", countryName: "United States" },
  { bank: "US Bank National Association", country: "US", countryName: "United States" },
  { bank: "Chase Bank USA", country: "US", countryName: "United States" },
  { bank: "Bank of America NA", country: "US", countryName: "United States" },
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

  // Simulate random delay
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));

  // 60% chance LIVE
  const isLive = Math.random() < 0.6;
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];

  if (isLive) {
    res.status(200).json({
      data,
      status: "Live",
      "card type": "Charge OK.",
      gate: "GATE_01",
      bank: bank.bank,
      country: bank.country,
      country_name: bank.countryName,
    });
  } else {
    res.status(200).json({
      data,
      status: "Die",
      "card type": "Declined.",
      gate: "GATE_01",
      bank: "",
      country: "",
      country_name: "",
    });
  }
};
