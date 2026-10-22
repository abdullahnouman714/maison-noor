// RAG index — products + policy docs chunked & embedded into the store's
// Embedding collection; retrieval is cosine similarity over those vectors
// (the local stand-in for Atlas Vector Search's $vectorSearch stage).
const { store } = require("../store");
const { embed, cosine } = require("./embeddings");

async function buildIndex() {
  store.embeddings = [];
  for (const p of store.products) {
    const chunkText = `${p.name}. ${p.scentFamily} fragrance for ${p.gender}. Notes — top: ${p.notes.top}; heart: ${p.notes.heart}; base: ${p.notes.base}. ${p.description} Price from $${p.variants[0].price}.`;
    store.embeddings.push({ refId: p.id, kind: "product", chunkText, embedding: await embed(chunkText) });
  }
  for (const pol of store.policies) {
    store.embeddings.push({ refId: pol.title, kind: "policy", chunkText: `${pol.title}: ${pol.content}`, embedding: await embed(pol.content) });
  }
  return store.embeddings.length;
}
async function retrieve(query, k = 5, kind = null) {
  if (!store.embeddings.length) await buildIndex();
  const qv = await embed(query);
  return store.embeddings
    .filter(e => !kind || e.kind === kind)
    .map(e => ({ ...e, score: cosine(qv, e.embedding) }))
    .sort((a, b) => b.score - a.score).slice(0, k);
}
module.exports = { buildIndex, retrieve };
