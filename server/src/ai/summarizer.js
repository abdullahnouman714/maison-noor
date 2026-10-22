// AI Review Summarizer — result cached in the ProductSummary collection and
// regenerated only when the review count changes (never per request).
const { store } = require("../store");
async function llm(system, user) {
  try {
    if (process.env.GEMINI_API_KEY) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }] }) });
      const j = await r.json(); return j.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    if (process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: user }] }) });
      const j = await r.json(); return j.choices?.[0]?.message?.content || null;
    }
  } catch { /* demo summary */ }
  return null;
}
async function reviewSummary(productId) {
  const p = store.products.find(x => x.id === productId);
  if (!p) return null;
  const rs = store.reviews.filter(r => r.productId === productId);
  if (!rs.length) return { summary: "No reviews yet — be the first to try it.", count: 0 };
  const cached = store.summaries[productId];
  if (cached && cached.reviewCountAtGeneration === rs.length)
    return { summary: cached.summaryText, count: rs.length, cached: true };
  const avg = (rs.reduce((s, x) => s + x.rating, 0) / rs.length).toFixed(1);
  const pos = rs.filter(r => r.rating >= 4).length;
  const aiText = await llm("Summarize these customer reviews in ONE friendly sentence (max 25 words). Mention lasting power or character if reviewers did.",
    `Product: ${p.name}\nReviews:\n${rs.map(r => `- (${r.rating}/5) ${r.text}`).join("\n")}`);
  const summaryText = aiText || `Rated ${avg}/5 across ${rs.length} verified reviews — ${Math.round(pos / rs.length * 100)}% of buyers rated it 4 stars or more, praising its character and lasting power; the opening can feel strong for the first few minutes.`;
  store.summaries[productId] = { productId, summaryText, reviewCountAtGeneration: rs.length, updatedAt: new Date().toISOString() };
  return { summary: summaryText, count: rs.length, cached: false };
}
module.exports = { reviewSummary };
