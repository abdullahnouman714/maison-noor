const router = require("express").Router();
const { store } = require("../store");
const { assistant } = require("../ai/assistant");
const { retrieve } = require("../ai/rag");
const { reviewSummary } = require("../ai/summarizer");
const { pubProduct } = require("../store");

router.post("/chat", async (req, res) => {
  const out = await assistant(req.body.message || "", req.body.sessionId || "web-" + (req.ip || "anon"));
  res.json(out);
});
// Streaming variant (SSE) — same agent, reply streamed in chunks; in LLM mode
// the provider stream can be piped here token-by-token.
router.post("/chat/stream", async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  const out = await assistant(req.body.message || "", req.body.sessionId || "web-stream");
  const words = out.reply.split(/(?<=\s)/);
  for (const w of words) { res.write(`data: ${JSON.stringify({ token: w })}\n\n`); await new Promise(r => setTimeout(r, 12)); }
  res.write(`data: ${JSON.stringify({ done: true, products: out.products, actions: out.actions, toolsUsed: out.toolsUsed })}\n\n`);
  res.end();
});
router.get("/search", async (req, res) => {
  const hits = await retrieve(req.query.q || "", 12, "product");
  const list = hits.map(h => store.products.find(p => p.id === h.refId)).filter(Boolean).map(pubProduct);
  res.json(list);
});
router.get("/products/:id/summary", async (req, res) => {
  const s = await reviewSummary(req.params.id);
  if (!s) return res.status(404).json({ error: "Product not found" });
  res.json(s);
});
module.exports = router;
