// Noor — the shopping assistant.
//
// How she works, in plain words:
// 1. She keeps a tiny bit of context per session (what she last recommended),
//    so "add it to cart" or "the second one" actually means something.
// 2. She checks the obvious intents first (order tracking, price, stock,
//    policies) because those have exact answers in the store data.
// 3. For recommendations she uses the RAG search over the catalogue and, if an
//    LLM key is configured, lets the model phrase the reply — grounded only in
//    the products the search returned. No key? She formats the same results
//    herself. Either way she never invents a product or a price.
//
// She also understands a bit of Roman Urdu (chahiye, dikhao, sasta, kitne ka)
// because a lot of our customers write that way.

const { store, money } = require("../store");
const { retrieve } = require("./rag");

// sessionId -> { lastProducts: [productId...], lastOrderId }
const sessionContext = new Map();
function getContext(sessionId) {
  if (!sessionContext.has(sessionId)) sessionContext.set(sessionId, { lastProducts: [], lastOrderId: null });
  return sessionContext.get(sessionId);
}

// ---------- tools (the agent's hands) ----------
const tools = {
  // search the catalogue (vector search over product embeddings)
  async searchProducts({ query = "", family = null, maxPrice = null, gender = null, sort = null }) {
    const hits = await retrieve(query || family || "fragrance", 10, "product");
    let out = hits.map(h => store.products.find(p => p.id === h.refId)).filter(Boolean);
    if (family) out = out.filter(p => p.scentFamily.toLowerCase() === family);
    if (gender) out = out.filter(p => p.gender === gender || p.gender === "Unisex");
    if (maxPrice) out = out.filter(p => p.variants[0].price <= maxPrice);
    if (sort === "cheap") out.sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === "premium") out.sort((a, b) => b.variants[0].price - a.variants[0].price);
    return out.slice(0, 4);
  },
  getProduct(nameOrId) {
    const needle = String(nameOrId).toLowerCase();
    return store.products.find(p => p.id === needle || p.name.toLowerCase() === needle)
        || store.products.find(p => needle.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(needle));
  },
  trackOrder(orderId, email) {
    return store.orders.find(x => x.id === orderId && (!email || x.email === email)) || null;
  },
  addToCartAction(product, size) {
    const variant = product.variants.find(v => v.size === size) || product.variants[0];
    return {
      type: "ADD_TO_CART",
      item: { productId: product.id, name: product.name, size: variant.size, price: variant.price, qty: 1, image: product.images[0] },
    };
  },
};

// optional LLM for phrasing (Gemini or OpenAI) — returns null in demo mode
async function askLLM(system, user) {
  try {
    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }] }),
      });
      const json = await res.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      });
      const json = await res.json();
      return json.choices?.[0]?.message?.content || null;
    }
  } catch (err) {
    // no key / network issue — demo phrasing below takes over
  }
  return null;
}

const mini = (p) => ({ id: p.id, name: p.name, scentFamily: p.scentFamily, priceFrom: p.variants[0].price, defaultSize: p.variants[0].size, image: p.images[0] });

// small Roman-Urdu / English normaliser so intents fire either way
function normalise(raw) {
  let q = " " + String(raw || "").toLowerCase() + " ";
  const swaps = [
    [/\bchahiye\b|\bchahye\b/g, " want "], [/\bdikhao\b|\bdikha\b|\bbatao\b/g, " show "],
    [/\bsasta\b|\bsasti\b|\bsaste\b/g, " cheap "], [/\bmehnga\b|\bmehngi\b/g, " premium expensive "],
    [/\bkitne ka\b|\bkitnay ka\b|\bkeemat\b|\bqemat\b/g, " price "], [/\bkharidna\b|\blena hai\b/g, " buy "],
    [/\bmujhe\b|\bmujhay\b/g, " i "], [/\bwala\b|\bwali\b/g, " "], [/\bhai\b/g, " is "],
    [/\bkya\b/g, " what "], [/\bapka\b|\baapka\b/g, " your "], [/\bkahan\b/g, " where "],
    [/\bmil jayega\b|\bmilega\b/g, " available "],
  ];
  for (const [pattern, replacement] of swaps) q = q.replace(pattern, replacement);
  return q.trim();
}

async function assistant(message, sessionId = "anon") {
  const ctx = getContext(sessionId);
  const raw = String(message || "");
  const q = normalise(raw);
  const toolsUsed = [];
  const actions = [];

  // every exchange is written to the ChatLog collection
  function save(role, content) {
    let log = store.chatLogs.find(x => x.sessionId === sessionId);
    if (!log) {
      log = { sessionId, userId: null, messages: [], createdAt: new Date().toISOString() };
      store.chatLogs.push(log);
    }
    log.messages.push({ role, content, toolCalls: role === "assistant" ? [...toolsUsed] : [], at: new Date().toISOString() });
  }
  function answer(reply, products = []) {
    if (products.length) ctx.lastProducts = products.map(p => p.id);
    save("assistant", reply);
    return { reply, products: products.map(mini), actions, toolsUsed };
  }
  save("user", raw);

  const namedProduct = tools.getProduct(q); // a product the customer mentioned by name

  // ---- follow-ups first: "add it", "add the second one", "yes please" ----
  const followUpAdd = /\badd (it|that|this|the first one|the second one|the third one)\b/.test(q) || (/\badd\b/.test(q) && !namedProduct);
  if (followUpAdd || (/^(yes|yeah|ok|okay|sure|please do|go ahead)\b/.test(q) && ctx.lastProducts.length)) {
    const pickWord = q.includes("second") ? 1 : q.includes("third") ? 2 : 0;
    const productId = ctx.lastProducts[pickWord] || ctx.lastProducts[0];
    const product = productId && store.products.find(p => p.id === productId);
    if (product) {
      toolsUsed.push("addToCart");
      const size = (raw.match(/(30|50|100)\s*ml/i) || [])[0]?.replace(/\s/g, "");
      actions.push(tools.addToCartAction(product, size));
      const item = actions[0].item;
      return answer(`Done — **${item.name} (${item.size})** is in your cart for ${money(item.price)}. Anything else, or shall I suggest something to pair with it?`);
    }
    return answer("I don't have a suggestion in mind yet — tell me what kind of scent you like (for example, 'something fresh for the office') and I'll find one to add.");
  }

  // ---- greetings & small talk ----
  if (/^(hi|hello|hey|salam|assalam|aoa|good (morning|evening|afternoon))\b/.test(q) && q.length < 40) {
    return answer("Hello, and welcome to Maison Noor ✦ I'm Noor, your fragrance assistant. Tell me what you're in the mood for — a scent for yourself, a gift, or help with an order — and I'll take it from there.");
  }
  if (/thank|shukriya/.test(q)) return answer("You're most welcome ✦ If you'd like, I can also help you find a second scent to layer with your pick — just ask.");
  if (/who are you|your name|tum (kon|kaun)/.test(q)) return answer("I'm Noor, Maison Noor's AI shopping assistant. I search our real catalogue, check stock and prices, explain policies and track orders — all from live store data.");
  if (/how are you|kaise ho|kaisi ho/.test(q)) return answer("I'm well, thank you for asking ✦ Ready to help you find a beautiful scent. What are you looking for today?");
  if (/^(bye|goodbye|allah hafiz)/.test(q)) return answer("Goodbye for now ✦ Your cart is saved whenever you're ready to come back.");

  // ---- order tracking ----
  const orderMatch = raw.match(/MN-?\s?(\d{4,})/i);
  if (orderMatch || ctx.lastOrderId && /\bstatus\b|\bwhere\b/.test(q)) {
    toolsUsed.push("trackOrder");
    const orderId = orderMatch ? "MN-" + orderMatch[1] : ctx.lastOrderId;
    const order = tools.trackOrder(orderId);
    if (order) {
      ctx.lastOrderId = order.id;
      return answer(`Order **${order.id}** for ${order.customer} is currently **${order.status}**. Items: ${order.items.map(i => `${i.name} (${i.size})`).join(", ")} — total ${money(order.total)}.${order.status === "Delivered" ? " Enjoy your fragrance!" : " You'll get an email the moment it moves to the next step."}`);
    }
    return answer(`I couldn't find an order with ID ${orderId}. It looks like MN-10240 — please check your confirmation email once, or reach our team at support@maisonnoor.com.`);
  }
  if (/\b(track|order status|my order|where.*order)\b/.test(q)) {
    return answer("Of course — share your order ID (it looks like MN-10240, from your confirmation email) and I'll check its live status.");
  }

  // ---- a named product: price / stock / details / add ----
  if (namedProduct) {
    const p = namedProduct;
    if (/\badd\b.*\bcart\b|\badd\b/.test(q) && /cart|basket/.test(q)) {
      toolsUsed.push("addToCart");
      const size = (raw.match(/(30|50|100)\s*ml/i) || [])[0]?.replace(/\s/g, "");
      actions.push(tools.addToCartAction(p, size));
      const item = actions[0].item;
      return answer(`Done — **${item.name} (${item.size})** added to your cart for ${money(item.price)}.`, [p]);
    }
    if (/price|cost|how much|rate/.test(q)) {
      toolsUsed.push("getProductDetails");
      return answer(`**${p.name}** comes in three sizes: ${p.variants.map(v => `${v.size} — ${money(v.price)}`).join(" · ")}. The ${p.variants[0].size} is the most popular way to start. Want me to add one to your cart?`, [p]);
    }
    if (/stock|available|sold out|in hand/.test(q)) {
      toolsUsed.push("getProductDetails");
      const lowest = Math.min(...p.variants.map(v => v.stock));
      return answer(lowest > 5
        ? `Yes — **${p.name}** is in stock across all sizes right now (${p.variants.map(v => `${v.size}: ${v.stock}`).join(" · ")}). Shall I add one to your cart?`
        : `**${p.name}** is available, but running low — one size is down to ${lowest} bottles. If you like it, I'd grab it soon. Want me to add it to your cart?`, [p]);
    }
    if (/detail|about|notes|describe|tell me|kaisa|kaisi/.test(q) || q.trim() === p.name.toLowerCase()) {
      toolsUsed.push("getProductDetails");
      return answer(`**${p.name}** (${p.scentFamily} · ${p.gender}) — ${p.description}\nNotes: top ${p.notes.top} · heart ${p.notes.heart} · base ${p.notes.base}.\nSizes: ${p.variants.map(v => `${v.size} ${money(v.price)}`).join(" · ")}. Say "add it to cart" whenever you're ready.`, [p]);
    }
  }

  // ---- store policies (RAG over the policy docs) ----
  const asksPolicy = /ship|deliver|return|refund|exchange|pay|payment|card|guarantee/.test(q);
  if (asksPolicy && !/want|show|recommend|buy/.test(q)) {
    toolsUsed.push("ragRetrieve");
    const route = [/ship|deliver|arrive|postage/.test(q) && "Shipping", /return|refund|exchange/.test(q) && "Returns",
      /guarantee/.test(q) && "Returns", /pay|payment|card|stripe/.test(q) && "Payments"].find(Boolean);
    const doc = route ? store.policies.find(x => x.title === route) : null;
    if (doc) return answer(doc.content);
    const hits = await retrieve(raw, 1, "policy");
    if (hits.length && hits[0].score > 0.05) return answer(hits[0].chunkText.replace(/^[^:]+:\s*/, ""));
  }

  // ---- human support ----
  if (/human|real person|agent|someone real|contact/.test(q)) {
    return answer("You can reach our human team at support@maisonnoor.com (Mon–Sat, replies within a few hours). If it's about an order, include the order ID and they'll pick it up right away.");
  }

  // ---- browse a scent family: "show me ouds", "any floral perfumes?" ----
  const families = { oud: "Oud", musk: "Musk", floral: "Floral", flower: "Floral", rose: "Floral", citrus: "Citrus", amber: "Amber", woody: "Woody", wood: "Woody", fresh: "Fresh", spicy: "Spicy", spice: "Spicy", attar: null };
  const familyWord = Object.keys(families).find(word => new RegExp(`\\b${word}`).test(q));
  const wantsBrowse = /show|browse|collection|range|any|list|suggest|recommend|want|looking|buy|gift/.test(q);

  // ---- recommendations (the main job) ----
  if (wantsBrowse || familyWord || /perfume|fragrance|scent|attar/.test(q)) {
    toolsUsed.push("searchProducts");
    const budget = (q.replace(/[$£,]/g, "").match(/(?:under|below|max|budget|within)\s*(\d+)/) || [])[1];
    const sort = /cheap|budget|lowest|affordable/.test(q) ? "cheap" : /premium|expensive|best|finest|luxury/.test(q) ? "premium" : null;
    const family = familyWord ? families[familyWord] : null;
    const gender = /\b(men|man|father|dad|him|husband|boyfriend)\b/.test(q) ? "Men" : /\b(women|woman|mother|mom|her|wife|girlfriend)\b/.test(q) ? "Women" : null;

    let found = await tools.searchProducts({ query: raw, family, maxPrice: budget ? +budget : null, gender, sort });
    if (!found.length && family) found = store.products.filter(p => p.scentFamily === family).slice(0, 4);
    if (!found.length) found = store.products.filter(p => p.isFeatured).slice(0, 3);

    const catalogueText = found.map(p => `${p.name} (${p.scentFamily}, ${p.gender}) from ${money(p.variants[0].price)} — ${p.description}`).join("\n");
    const phrased = await askLLM(
      "You are Noor, shopping assistant for Maison Noor perfume store. Recommend ONLY from the products given. Warm, brief (3-4 sentences), best match first. Never invent products or prices.",
      `Customer said: "${raw}"\nProducts from the live catalogue:\n${catalogueText}`
    );
    const intro = family ? `Here is our ${family} selection` : sort === "cheap" ? "Here are the friendliest prices in the store" : "Here are my top matches for you";
    return answer(phrased || `${intro}:\n\n${found.map(p => `**${p.name}** (${p.scentFamily}) — from ${money(p.variants[0].price)}. ${p.description}`).join("\n\n")}\n\nTap Add on any of them, or just say "add it" and I'll put the first one in your cart.`, found);
  }

  // ---- honest fallback ----
  return answer("Let me make sure I help with the right thing. I can:\n• Recommend a scent — try \"a fresh office fragrance under $60\" or \"show me ouds\"\n• Check a product — \"price of Midnight Oud\" or \"is Rose Taif in stock?\"\n• Track an order if you share its ID\n• Explain shipping, returns or payment\nWhat would you like?");
}

module.exports = { assistant, tools };
