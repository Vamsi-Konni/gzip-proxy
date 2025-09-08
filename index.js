const express = require("express");
const fetch = require("node-fetch");
const zlib = require("zlib");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with the actual Upstox instruments URL
const UPSTREAM_URL = "https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz";

app.get("/proxy", async (req, res) => {
  try {
    console.log("Fetching from:", UPSTREAM_URL);

    const response = await fetch(UPSTREAM_URL, {
      headers: { "Accept-Encoding": "gzip" }
    });

    if (!response.ok) {
      console.error("Upstream error:", response.status, response.statusText);
      return res.status(response.status).send("Upstream fetch failed");
    }

    const buffer = await response.buffer();
    console.log("Downloaded bytes:", buffer.length);

    zlib.gunzip(buffer, (err, decompressed) => {
      if (err) {
        console.error("Decompression error:", err.message);
        return res.status(500).send("Error decompressing data");
      }

      let jsonData;
      try {
        jsonData = JSON.parse(decompressed.toString());
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr.message);
        return res.status(500).send("Error parsing JSON");
      }

      console.log("Total instruments:", jsonData.length);

      // Pagination
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 100;
      let start = (page - 1) * limit;
      let end = start + limit;

      const slice = jsonData.slice(start, end);
      res.json(slice);
    });
  } catch (e) {
    console.error("Proxy error:", e.message);
    res.status(500).send("Proxy failed");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
