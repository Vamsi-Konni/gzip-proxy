import express from "express";
import fetch from "node-fetch";
import zlib from "zlib";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/proxy", async (req, res) => {
  try {
    const response = await fetch("https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz");
    const buffer = await response.arrayBuffer();
    const decompressed = zlib.gunzipSync(Buffer.from(buffer));
    res.setHeader("Content-Type", "application/json");
    res.send(decompressed.toString());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));
