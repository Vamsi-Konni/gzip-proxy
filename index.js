const express = require("express");
const fetch = require("node-fetch");
const zlib = require("zlib");

const app = express();

app.get("/proxy", async (req, res) => {
  try {
    // Fetch the gzipped JSON from the upstream source
    const response = await fetch("https://api.upstox.com/v2/market/instruments");
    const buffer = await response.buffer();

    // Decompress gzip
    const decompressed = zlib.gunzipSync(buffer).toString("utf-8");

    // Parse into JSON
    const data = JSON.parse(decompressed);

    // === Pagination support ===
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const start = (page - 1) * limit;
    const end = start + limit;

    // Slice array into requested chunk
    const pagedData = data.slice(start, end);

    // Return only the requested chunk
    res.json(pagedData);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching or decompressing data");
  }
});

// Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
