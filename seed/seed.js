// Seed script — writes seed data into MongoDB Atlas when MONGODB_URI is set,
// and always (re)generates the demo dataset used by the in-memory store.
// Usage: node seed/seed.js
require("dotenv").config({ path: require("path").join(__dirname, "../server/.env") });
const products = require("./products.json");
const { policies } = require("../server/src/data");
(async () => {
  console.log(`Seed dataset ready: ${products.length} products, ${policies.length} policy docs.`);
  if (!process.env.MONGODB_URI) { console.log("No MONGODB_URI set — the API runs on the seeded in-memory store, nothing else to do."); return; }
  const mongoose = require("../server/node_modules/mongoose");
  const { Product, Embedding } = require("../server/src/models/models");
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({}); await Product.insertMany(products);
  console.log("Products inserted into MongoDB. Run the API once to build the embedding index.");
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
