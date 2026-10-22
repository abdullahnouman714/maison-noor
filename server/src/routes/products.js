const router = require("express").Router();
const { store, pubProduct } = require("../store");
const { auth, adminOnly } = require("../middleware/auth");
const { uploadImage } = require("../services/cloudinary");
const { buildIndex } = require("../ai/rag");

router.get("/", (req, res) => {
  let list = store.products.filter(p => p.isActive).map(pubProduct);
  const { family, gender, maxPrice, sort, featured, search } = req.query;
  if (family) list = list.filter(p => p.scentFamily === family);
  if (gender) list = list.filter(p => p.gender === gender || p.gender === "Unisex");
  if (maxPrice) list = list.filter(p => p.variants[0].price <= +maxPrice);
  if (featured) list = list.filter(p => p.isFeatured);
  if (search) list = list.filter(p => (p.name + p.scentFamily + p.description).toLowerCase().includes(search.toLowerCase()));
  if (sort === "price-asc") list.sort((a, b) => a.variants[0].price - b.variants[0].price);
  if (sort === "price-desc") list.sort((a, b) => b.variants[0].price - a.variants[0].price);
  if (sort === "rating") list.sort((a, b) => b.ratingAvg - a.ratingAvg);
  res.json(list);
});
router.get("/:slug", (req, res) => {
  const p = store.products.find(x => x.slug === req.params.slug || x.id === req.params.slug);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json({ ...pubProduct(p), reviews: store.reviews.filter(r => r.productId === p.id) });
});
router.get("/:id/reviews", (req, res) => res.json(store.reviews.filter(r => r.productId === req.params.id)));
router.post("/:id/reviews", auth, (req, res) => {
  const { rating, text } = req.body;
  const bought = store.orders.some(o => o.email === req.user.email && o.items.some(i => i.productId === req.params.id));
  if (!bought) return res.status(403).json({ error: "Reviews are for verified buyers only" });
  const r = { id: "rev-" + Date.now(), productId: req.params.id, userId: req.user.id, author: req.user.name, rating: +rating, text, date: new Date().toISOString() };
  store.reviews.push(r);
  delete store.summaries[req.params.id]; // summary regenerates on next read (new review count)
  res.status(201).json(r);
});

// Admin product CRUD
router.post("/", auth, adminOnly, async (req, res) => {
  const b = req.body;
  const slug = (b.slug || b.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const images = [];
  for (const im of (b.images || [])) images.push(await uploadImage(im));
  const p = { id: slug, slug, name: b.name, brandLine: b.brandLine || "Maison Noor Original", scentFamily: b.scentFamily || "Fresh",
    gender: b.gender || "Unisex", notes: b.notes || { top: "-", heart: "-", base: "-" }, description: b.description || "",
    variants: b.variants?.length ? b.variants : [{ size: "50ml", price: +b.price || 50, stock: +b.stock || 10, sku: slug.slice(0, 3).toUpperCase() + "-50" }],
    images: images.length ? images : ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"],
    isFeatured: !!b.isFeatured, isActive: true, createdAt: new Date().toISOString() };
  store.products.push(p);
  buildIndex().catch(() => {});
  res.status(201).json(pubProduct(p));
});
router.put("/:id", auth, adminOnly, (req, res) => {
  const p = store.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  const { name, description, scentFamily, gender, isFeatured, isActive, notes } = req.body;
  Object.assign(p, Object.fromEntries(Object.entries({ name, description, scentFamily, gender, isFeatured, isActive, notes }).filter(([, v]) => v !== undefined)));
  if (req.body.variants?.length) p.variants = req.body.variants;
  buildIndex().catch(() => {});
  res.json(pubProduct(p));
});
router.delete("/:id", auth, adminOnly, (req, res) => {
  const i = store.products.findIndex(x => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Product not found" });
  store.products.splice(i, 1);
  buildIndex().catch(() => {});
  res.json({ deleted: true });
});
module.exports = router;
