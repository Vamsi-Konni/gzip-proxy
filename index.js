import express from "express";
import fetch from "node-fetch";
import zlib from "zlib";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "changeme";

app.get("/proxy", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const url = "https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz";
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    zlib.gunzip(Buffer.from(buffer), (err, decompressed) => {
      if (err) {
        return res.status(500).json({ error: "Failed to decompress" });
      }
      res.setHeader("Content-Type", "application/json");
      res.send(decompressed.toString("utf-8"));
    });
  } catch (error) {
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on ${PORT}`);
});

