require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { store } = require("./store");
const { buildIndex } = require("./ai/rag");

// The Express app, exported on its own so it can run two ways:
// 1. locally / on a server  -> src/index.js calls app.listen()
// 2. on Vercel serverless   -> /api/index.js at the repo root exports this app
const app = express();
app.use(cors());
app.use("/api/webhooks", require("./routes/webhooks")); // needs the raw body — mount before express.json()
app.use(express.json({ limit: "8mb" }));

// the RAG index is built once; the first request waits for it if needed
let indexReady = null;
app.use(async (_req, _res, next) => {
  if (!indexReady) indexReady = buildIndex().catch(() => 0);
  await indexReady;
  next();
});

app.get("/api/health", (_req, res) => res.json({
  ok: true, service: "Maison Noor API",
  aiMode: (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) ? "LLM" : "smart-demo",
  embeddings: store.embeddings.length,
}));
app.get("/api/policies", (_req, res) => res.json(store.policies));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/ai", require("./routes/ai"));

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: err.message || "Server error" }); });

module.exports = app;
