// Embeddings — provider embeddings when a key exists (Gemini/OpenAI),
// otherwise a deterministic local vector (hashed token embedding, 256-dim).
// This keeps vector search genuinely functional in zero-key demo mode; in
// production the same vectors live in MongoDB Atlas ($vectorSearch).
const DIM = 256;
function localEmbed(text) {
  const v = new Array(DIM).fill(0);
  const words = (text || "").toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
  const grams = [...words];
  words.forEach(w => { for (let i = 0; i < w.length - 2; i++) grams.push(w.slice(i, i + 3)); });
  grams.forEach(g => {
    let h = 2166136261;
    for (let i = 0; i < g.length; i++) { h ^= g.charCodeAt(i); h = Math.imul(h, 16777619); }
    v[Math.abs(h) % DIM] += 1;
  });
  const norm = Math.hypot(...v) || 1;
  return v.map(x => x / norm);
}
async function embed(text) {
  try {
    if (process.env.GEMINI_API_KEY) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: { parts: [{ text }] } }) });
      const j = await r.json();
      if (j.embedding?.values?.length) return j.embedding.values;
    }
    if (process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/embeddings",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: "text-embedding-3-small", input: text }) });
      const j = await r.json();
      if (j.data?.[0]?.embedding?.length) return j.data[0].embedding;
    }
  } catch { /* fall back */ }
  return localEmbed(text);
}
const cosine = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i];
  return d;
};
module.exports = { embed, cosine, localEmbed };
