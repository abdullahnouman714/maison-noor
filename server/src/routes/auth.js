const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { store } = require("../store");
const { auth, sign } = require("../middleware/auth");

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });
  if (store.users.some(u => u.email === email)) return res.status(400).json({ error: "Email already registered" });
  const u = { id: "u-" + Date.now(), name, email, passwordHash: bcrypt.hashSync(password, 8), role: "customer", addresses: [], wishlist: [], createdAt: new Date().toISOString() };
  store.users.push(u);
  res.status(201).json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const u = store.users.find(x => x.email === email);
  if (!u || !bcrypt.compareSync(password || "", u.passwordHash)) return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});
router.post("/refresh", auth, (req, res) => {
  const u = store.users.find(x => x.id === req.user.id);
  if (!u) return res.status(401).json({ error: "User not found" });
  res.json({ token: sign(u) });
});
router.get("/me", auth, (req, res) => res.json({ user: req.user }));
module.exports = router;
