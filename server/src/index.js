// Local / traditional server entry — on Vercel the app is exported instead (see /api/index.js)
const app = require("./app");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Maison Noor API → http://localhost:${PORT}`));
