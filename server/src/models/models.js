// Mongoose models for production (MongoDB Atlas).
// The demo server runs on the seeded in-memory store in src/data.js so it works
// with zero setup; these schemas mirror that data exactly — connect with
// mongoose.connect(process.env.MONGODB_URI) and swap the route queries.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, passwordHash: String,
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  addresses: [Object], wishlist: [{ type: String }],
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, brandLine: String,
  scentFamily: { type: String, enum: ["Oud", "Musk", "Floral", "Citrus", "Amber", "Woody", "Fresh", "Spicy"] },
  gender: { type: String, enum: ["Men", "Women", "Unisex"] },
  notes: { top: String, heart: String, base: String }, description: String,
  variants: [{ size: String, price: Number, stock: Number, sku: String }],
  images: [String], isFeatured: Boolean, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  userId: String, email: String, customer: String,
  items: [{ productId: String, name: String, size: String, qty: Number, price: Number }],
  subtotal: Number, shipping: Number, total: Number, stripePaymentIntentId: String,
  status: { type: String, enum: ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Placed" },
  shippingAddress: Object,
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  productId: String, userId: String, author: String, rating: { type: Number, min: 1, max: 5 }, text: String,
}, { timestamps: true });

const embeddingSchema = new mongoose.Schema({ // Atlas Vector Search collection
  refId: String, kind: { type: String, enum: ["product", "policy"] }, chunkText: String, embedding: [Number],
});

module.exports = {
  User: mongoose.models.User || mongoose.model("User", userSchema),
  Product: mongoose.models.Product || mongoose.model("Product", productSchema),
  Order: mongoose.models.Order || mongoose.model("Order", orderSchema),
  Review: mongoose.models.Review || mongoose.model("Review", reviewSchema),
  Embedding: mongoose.models.Embedding || mongoose.model("Embedding", embeddingSchema),
};

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true }, type: { type: String, enum: ["percent", "fixed"] },
  value: Number, minSpend: Number, expiry: Date, isActive: { type: Boolean, default: true },
});
const chatLogSchema = new mongoose.Schema({
  sessionId: String, userId: String,
  messages: [{ role: String, content: String, toolCalls: [String], at: Date }],
}, { timestamps: true });
const productSummarySchema = new mongoose.Schema({
  productId: { type: String, unique: true }, summaryText: String,
  reviewCountAtGeneration: Number,
}, { timestamps: true });
const policyDocSchema = new mongoose.Schema({ title: String, content: String, embedding: [Number] });

module.exports.Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
module.exports.ChatLog = mongoose.models.ChatLog || mongoose.model("ChatLog", chatLogSchema);
module.exports.ProductSummary = mongoose.models.ProductSummary || mongoose.model("ProductSummary", productSummarySchema);
module.exports.PolicyDoc = mongoose.models.PolicyDoc || mongoose.model("PolicyDoc", policyDocSchema);
