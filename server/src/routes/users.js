const router = require("express").Router();
const { store } = require("../store");
const { auth } = require("../middleware/auth");

// Wishlist server sync
router.get("/wishlist", auth, (req, res) => {
  const u = store.users.find(x => x.id === req.user.id);
  res.json({ wishlist: u?.wishlist || [] });
});
router.post("/wishlist", auth, (req, res) => {
  const u = store.users.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ error: "User not found" });
  const { productId, action } = req.body;
  if (action === "set") u.wishlist = Array.isArray(req.body.wishlist) ? req.body.wishlist : u.wishlist;
  else if (productId) {
    u.wishlist = u.wishlist.includes(productId) ? u.wishlist.filter(w => w !== productId) : [...u.wishlist, productId];
  }
  res.json({ wishlist: u.wishlist });
});
router.put("/addresses", auth, (req, res) => {
  const u = store.users.find(x => x.id === req.user.id);
  u.addresses = req.body.addresses || [];
  res.json({ addresses: u.addresses });
});
module.exports = router;
