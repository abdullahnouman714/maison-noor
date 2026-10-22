const jwt = require("jsonwebtoken");
const SECRET = () => process.env.JWT_SECRET || "maison-noor-demo-secret";
const sign = (u) => jwt.sign({ id: u.id, name: u.name, email: u.email, role: u.role }, SECRET(), { expiresIn: "7d" });
const auth = (req, res, next) => {
  const t = (req.headers.authorization || "").replace("Bearer ", "");
  try { req.user = jwt.verify(t, SECRET()); next(); }
  catch { res.status(401).json({ error: "Not authenticated" }); }
};
const adminOnly = (req, res, next) => req.user?.role === "admin" ? next() : res.status(403).json({ error: "Admin only" });
module.exports = { auth, adminOnly, sign };
