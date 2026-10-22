// Central data store (demo: in-memory, seeded from seed data).
// Production: replace with Mongoose models in ./models — route code uses the
// same shapes, so the swap does not change the API.
const seed = require("./data");
const bcrypt = require("bcryptjs");

const store = {
  users: [
    { id: "u-admin", name: "Admin", email: "admin@maisonnoor.com", passwordHash: bcrypt.hashSync("admin123", 8), role: "admin", addresses: [], wishlist: [], createdAt: new Date().toISOString() },
    { id: "u-demo", name: "Demo Customer", email: "demo@maisonnoor.com", passwordHash: bcrypt.hashSync("demo1234", 8), role: "customer", addresses: [], wishlist: ["midnight-oud"], createdAt: new Date().toISOString() },
  ],
  products: seed.products,
  reviews: seed.reviews,
  orders: seed.orders,
  policies: seed.policies,              // PolicyDoc collection
  coupons: [                              // Coupon collection
    { code: "NOOR10", type: "percent", value: 10, minSpend: 0, expiry: "2027-12-31", isActive: true },
    { code: "FIRST50", type: "fixed", value: 50, minSpend: 150, expiry: "2027-06-30", isActive: true },
    { code: "ATTAR15", type: "percent", value: 15, minSpend: 60, expiry: "2027-03-31", isActive: true },
  ],
  chatLogs: [],                           // ChatLog collection (session-based)
  summaries: {},                          // ProductSummary cache: productId -> {summaryText, reviewCountAtGeneration, updatedAt}
  embeddings: [],                         // {refId, kind: 'product'|'policy', chunkText, embedding[]}
};

const avgRating = (id) => { const r = store.reviews.filter(x => x.productId === id); return r.length ? +(r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1) : 0; };
const countRating = (id) => store.reviews.filter(x => x.productId === id).length;
const pubProduct = (p) => ({ ...p, ratingAvg: avgRating(p.id), ratingCount: countRating(p.id) });
const money = (n) => "$" + n;

module.exports = { store, avgRating, countRating, pubProduct, money };
