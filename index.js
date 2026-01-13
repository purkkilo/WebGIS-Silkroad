const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Absolute path to Vue dist
const distPath = path.join(__dirname, "client", "dist");

// --- Middleware
app.use(cors());
app.use(express.json());

// --- Serve static assets FIRST
app.use(express.static(distPath));

// --- SPA fallback (Express 5 compatible)
app.use((_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving Vue app from: ${distPath}`);
});

module.exports = app;
