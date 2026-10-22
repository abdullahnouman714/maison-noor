const router = require("express").Router();
const { store } = require("../store");
const { auth, adminOnly } = require("../middleware/auth");
const { copilot } = require("../ai/copilot");
router.use(auth, adminOnly);

router.get("/stats", (_req, res) => {
  const revenue = store.orders.reduce((s, o) => s + o.total, 0);
  const byDay = {};
  store.orders.forEach(o => { const d = o.createdAt.slice(0, 10); byDay[d] = (byDay[d] || 0) + o.total; });
  const lowStock = store.products.map(p => ({ name: p.name, stock: Math.min(...p.variants.map(v => v.stock)) })).filter(x => x.stock <= 5);
  res.json({ revenue, orderCount: store.orders.length, productCount: store.products.length, lowStock,
    chatSessions: store.chatLogs.length, salesByDay: Object.entries(byDay).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date)),
    recentOrders: store.orders.slice(0, 8) });
});
router.get("/products", (_req, res) => res.json(store.products));
router.put("/orders/:id/status", (req, res) => {
  const o = store.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Order not found" });
  o.status = req.body.status; res.json(o);
});
router.get("/coupons", (_req, res) => res.json(store.coupons));
router.post("/coupons", (req, res) => {
  const { code, type, value, minSpend, expiry } = req.body;
  if (store.coupons.some(c => c.code === code?.toUpperCase())) return res.status(400).json({ error: "Coupon code already exists" });
  const c = { code: code.toUpperCase(), type: type || "percent", value: +value, minSpend: +minSpend || 0, expiry: expiry || "2027-12-31", isActive: true };
  store.coupons.push(c); res.status(201).json(c);
});
router.get("/chatlogs", (_req, res) => res.json(store.chatLogs.slice(-20)));
router.post("/ai/copilot", (req, res) => res.json(copilot(req.body.question)));
module.exports = router;
