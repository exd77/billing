// Vercel serverless function — proxies to chkr.cc API to bypass CORS
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "Missing data field" });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const apiResp = await fetch("https://api.chkr.cc/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await apiResp.text();
    res.setHeader("Content-Type", "application/json");
    res.status(apiResp.status).send(text);
  } catch (err) {
    // Timeout or network error — return rate_limit so client falls back to test data
    res.status(200).json({ error: "rate_limited", message: err.message });
  }
};
