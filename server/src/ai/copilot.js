// Admin AI Copilot — agentic tool-calling over live store data.
// Tools: querySales, lowStockReport, topProducts, customerStats.
const { store, money } = require("../store");
const toolImpl = {
  querySales() {
    const week = store.orders.filter(o => Date.now() - new Date(o.createdAt) < 7 * 864e5);
    return { weekOrders: week.length, weekRevenue: week.reduce((s, o) => s + o.total, 0), totalOrders: store.orders.length, totalRevenue: store.orders.reduce((s, o) => s + o.total, 0) };
  },
  lowStockReport() {
    return store.products.map(p => ({ name: p.name, min: Math.min(...p.variants.map(v => v.stock)) })).filter(x => x.min <= 5).sort((a, b) => a.min - b.min);
  },
  topProducts() {
    const counts = {};
    store.orders.forEach(o => o.items.forEach(i => { counts[i.name] = (counts[i.name] || 0) + i.qty; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  },
  customerStats() {
    const byCust = {};
    store.orders.forEach(o => { byCust[o.customer] = (byCust[o.customer] || 0) + o.total; });
    return { count: Object.keys(byCust).length, top: Object.entries(byCust).sort((a, b) => b[1] - a[1]).slice(0, 5) };
  },
};
function copilot(question) {
  const q = (question || "").toLowerCase();
  const toolsUsed = [];
  const use = (name) => { toolsUsed.push(name); return toolImpl[name](); };

  if (/customer|buyer|top 5|best customer/.test(q) && !/product/.test(q)) {
    const c = use("customerStats");
    return { answer: `You have **${c.count} customers** with orders. Top by spend:\n${c.top.map(([n, v], i) => `${i + 1}. ${n} — ${money(v)}`).join("\n")}`, toolsUsed };
  }
  if (/sales|revenue|sold|earn|this week|income/.test(q)) {
    const d = use("querySales");
    return { answer: `In the last 7 days: **${d.weekOrders} orders** totalling **${money(d.weekRevenue)}**. All-time revenue is ${money(d.totalRevenue)} across ${d.totalOrders} orders.`, toolsUsed };
  }
  if (/stock|running out|low|inventory|reorder/.test(q)) {
    const low = use("lowStockReport");
    return { answer: low.length ? `Running low (a size at 5 or under):\n${low.map(x => `• **${x.name}** — lowest size stock: ${x.min}`).join("\n")}\n\nReorder **${low[0].name}** first — it's also a strong seller.` : "All products are comfortably stocked.", toolsUsed };
  }
  if (/top|best|popular|selling|product/.test(q)) {
    const top = use("topProducts");
    return { answer: `Top sellers by units ordered:\n${top.map(([n, c], i) => `${i + 1}. **${n}** — ${c} sold`).join("\n")}`, toolsUsed };
  }
  return { answer: "I answer from live store data. Try: 'What were this week's sales?', 'Which products are running out of stock?', 'Top selling products?' or 'Who are my top 5 customers?'", toolsUsed };
}
module.exports = { copilot, toolImpl };
