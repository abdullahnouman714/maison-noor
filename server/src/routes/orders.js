const router = require("express").Router();
const { store } = require("../store");
const { auth } = require("../middleware/auth");
const { createPaymentIntent, constructWebhookEvent } = require("../services/stripe");
const { sendOrderConfirmation } = require("../services/email");

const applyCoupon = (code, subtotal) => {
  if (!code) return { discount: 0, coupon: null, error: null };
  const c = store.coupons.find(x => x.code === code.toUpperCase() && x.isActive);
  if (!c) return { discount: 0, coupon: null, error: "Invalid coupon code" };
  if (new Date(c.expiry) < new Date()) return { discount: 0, coupon: null, error: "Coupon expired" };
  if (subtotal < c.minSpend) return { discount: 0, coupon: null, error: `Coupon needs a minimum spend of $${c.minSpend}` };
  const discount = c.type === "percent" ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
  return { discount, coupon: c.code, error: null };
};

router.post("/validate-coupon", (req, res) => {
  const out = applyCoupon(req.body.code, +req.body.subtotal || 0);
  if (out.error) return res.status(400).json({ error: out.error });
  res.json({ discount: out.discount, coupon: out.coupon });
});

router.post("/create-payment-intent", async (req, res) => {
  const { items, email, name, address, couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ error: "Cart is empty" });
  let subtotal = 0;
  const lineItems = items.map(it => {
    const p = store.products.find(x => x.id === it.productId);
    const v = p?.variants.find(v => v.size === it.size);
    if (!p || !v) throw new Error("Invalid item: " + it.productId);
    if (v.stock < it.qty) throw new Error(`Only ${v.stock} left of ${p.name} (${it.size})`);
    subtotal += v.price * it.qty;
    return { productId: p.id, name: p.name, size: it.size, qty: it.qty, price: v.price };
  });
  const { discount, coupon, error } = applyCoupon(couponCode, subtotal);
  if (error) return res.status(400).json({ error });
  const shipping = subtotal - discount > 75 || subtotal === 0 ? 0 : 6;
  const total = subtotal - discount + shipping;
  const { clientSecret, paymentIntentId } = await createPaymentIntent({ amount: total, email });
  const order = { id: "MN-" + (10300 + store.orders.length * 7 + 11), userId: req.body.userId || null, email, customer: name,
    items: lineItems, subtotal, discount, coupon, shippingFee: shipping, shipping, total,
    stripePaymentIntentId: paymentIntentId, status: "Placed", shippingAddress: address, address, createdAt: new Date().toISOString() };
  lineItems.forEach(it => { const p = store.products.find(x => x.id === it.productId); const v = p.variants.find(v => v.size === it.size); v.stock -= it.qty; });
  store.orders.unshift(order);
  sendOrderConfirmation(order).catch(() => {});
  res.status(201).json({ clientSecret, order });
});

router.get("/track", (req, res) => {
  const o = store.orders.find(x => x.id === req.query.id && (!req.query.email || x.email === req.query.email));
  if (!o) return res.status(404).json({ error: "Order not found" });
  res.json(o);
});
router.get("/mine", auth, (req, res) => res.json(store.orders.filter(o => o.email === req.user.email)));
module.exports = router;
