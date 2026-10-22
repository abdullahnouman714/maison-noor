// Seed data for Maison Noor — demo dataset (products, reviews, orders, policies)
// Images: Unsplash perfume photography (free to use via images.unsplash.com)
const IMG = [
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80",
];

const P = (name, family, gender, top, heart, base, desc, basePrice, stock, featured, imgIdx) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  brandLine: "Maison Noor Original",
  scentFamily: family, gender,
  notes: { top, heart, base },
  description: desc,
  variants: [
    { size: "30ml", price: basePrice, stock: Math.max(stock, 6), sku: name.slice(0, 3).toUpperCase() + "-30" },
    { size: "50ml", price: Math.round(basePrice * 1.45), stock, sku: name.slice(0, 3).toUpperCase() + "-50" },
    { size: "100ml", price: Math.round(basePrice * 2.2), stock: Math.max(stock - 2, 4), sku: name.slice(0, 3).toUpperCase() + "-100" },
  ],
  images: [IMG[imgIdx % IMG.length], IMG[(imgIdx + 3) % IMG.length]],
  isFeatured: !!featured, isActive: true,
});

const products = [
  P("Midnight Oud", "Oud", "Unisex", "Saffron, Bergamot", "Rose, Oud Wood", "Amber, Leather", "A deep, smouldering oud for evenings that turn into nights. Our best-selling signature — rich, warm and unapologetically bold.", 68, 14, true, 0),
  P("White Musk Noor", "Musk", "Women", "Aldehydes, Pear", "White Musk, Iris", "Sandalwood, Vanilla", "Clean, soft and luminous — like fresh linen and morning light. The perfect everyday and office scent.", 45, 22, true, 1),
  P("Amber Dusk", "Amber", "Unisex", "Cardamom, Bergamot", "Amber, Cinnamon", "Tonka, Benzoin", "Golden hour in a bottle. Warm amber wrapped in spice, made for autumn evenings and close conversations.", 58, 9, true, 2),
  P("Citrus Veil", "Citrus", "Unisex", "Grapefruit, Lemon", "Neroli, Green Tea", "White Musk, Cedar", "Bright and weightless. A sparkling citrus veil that keeps you fresh through the longest summer day.", 39, 30, false, 3),
  P("Rose Taif", "Floral", "Women", "Pink Pepper", "Taif Rose, Peony", "Musk, Patchouli", "Thirty roses in every drop. A regal Damask rose inspired by the gardens of Taif, softened with peony.", 72, 11, true, 4),
  P("Santal Royal", "Woody", "Men", "Bergamot, Nutmeg", "Sandalwood, Papyrus", "Leather, Cedarwood", "Creamy sandalwood with a tailored, boardroom polish. Quiet confidence, bottled.", 64, 17, false, 5),
  P("Vanilla Noir", "Amber", "Women", "Rum, Plum", "Vanilla Orchid", "Dark Vanilla, Suede", "Not your sweet vanilla — this one is dark, grown and a little dangerous. A compliment magnet after dark.", 55, 3, false, 6),
  P("Ocean Mist Attar", "Fresh", "Men", "Sea Salt, Bergamot", "Marine Accord, Sage", "Driftwood, Musk", "Alcohol-free attar oil. Sea breeze and salt skin, concentrated to last 10+ hours from a single roll-on.", 32, 26, false, 7),
  P("Jasmine Court", "Floral", "Women", "Green Leaves", "Jasmine Sambac, Tuberose", "White Amber", "A courtyard of jasmine after rain. Lush, romantic and unmistakably feminine.", 49, 19, false, 8),
  P("Leather & Smoke", "Woody", "Men", "Thyme, Birch", "Leather, Tobacco", "Smoked Cedar, Vetiver", "A worn leather jacket by a campfire. Rugged, smoky and built for winter nights.", 62, 8, false, 9),
  P("Golden Saffron", "Amber", "Unisex", "Saffron, Almond", "Jasmine, Amberwood", "Fir Resin, Cedar", "Rare Persian saffron over glowing amberwood. Opulent without shouting — luxury that whispers.", 95, 6, true, 0),
  P("Fig & Neroli", "Citrus", "Unisex", "Fig Leaf, Bergamot", "Neroli, Fig Fruit", "Cedar, Musk", "Mediterranean shade on a hot day. Green fig and orange blossom in perfect balance.", 44, 16, false, 1),
  P("Black Pepper Club", "Spicy", "Men", "Black Pepper, Grapefruit", "Lavender, Geranium", "Vetiver, Amber", "Sharp pepper over a classic fougère heart. The gym-to-dinner all-rounder for men.", 48, 21, false, 2),
  P("Peony Silk", "Floral", "Women", "Lychee, Mandarin", "Peony, Rose Water", "Silk Musk", "Soft-focus peony with a lychee sparkle. Bridal-shower pretty, wedding-guest ready.", 42, 25, false, 3),
  P("Pure Musk Attar", "Musk", "Unisex", "Clean Cotton", "White Musk", "Ambergris Accord", "Alcohol-free pure musk oil — your skin but better. Layers under any fragrance or shines alone.", 28, 2, false, 4),
  P("Cedar Atlas", "Woody", "Men", "Pink Pepper, Cardamom", "Atlas Cedar, Iris", "Sandal, Amber", "Mountain air and dry cedarwood. Minimal, modern, and endlessly wearable at the office.", 52, 13, false, 5),
  P("Honey Oud", "Oud", "Unisex", "Honey, Cinnamon", "Oud, Rose", "Vanilla, Amber", "Wild honey poured over smoky oud. Sweetness with a backbone — a winter masterpiece.", 84, 7, false, 6),
  P("Green Tea Ceremony", "Fresh", "Unisex", "Bergamot, Mint", "Green Tea, Jasmine", "Maté, Musk", "A moment of calm. Steamed green tea and mint, serene and zen-clean for daily wear.", 38, 28, false, 7),
  P("Iris Poudre", "Floral", "Women", "Violet Leaf", "Iris, Mimosa", "Powdery Musk, Tonka", "Vintage powder and silk gloves. An elegant iris that feels like a Parisian dressing table.", 59, 10, false, 8),
  P("Desert Rose Attar", "Floral", "Women", "Damask Rose", "Rose Absolute, Litchi", "Oud, Amber", "Alcohol-free rose attar oil from the heart of the desert bloom. One drop blooms for hours.", 36, 15, false, 9),
  P("Vetiver Storm", "Woody", "Men", "Grapefruit, Sage", "Vetiver, Nutmeg", "Oakmoss, Amber", "Electric vetiver before the rain breaks. Green, earthy and charged with energy.", 54, 12, false, 0),
  P("Coconut Palm", "Fresh", "Women", "Coconut Water, Lime", "Tiare Flower, Coconut Milk", "Vanilla, Sandalwood", "A beach holiday that never ends. Creamy coconut and tiare over warm skin.", 41, 20, false, 1),
  P("Royal Cambodi Oud", "Oud", "Men", "Cambodian Oud", "Aged Oud, Spice", "Dark Amber, Musk", "Pure aged Cambodian oud oil — animalic, honeyed, profound. For true oud connoisseurs.", 120, 4, true, 2),
  P("Lavender Fields", "Fresh", "Unisex", "Lavender, Bergamot", "Lavender Absolute, Clary Sage", "Tonka, Coumarin", "Provence at dusk. Herbal lavender smoothed with tonka — your evening wind-down ritual.", 40, 18, false, 3),
  P("Spiced Chai", "Spicy", "Unisex", "Chai Spices, Orange", "Black Tea, Cardamom", "Vanilla, Sandalwood", "A steaming cup of masala chai, bottled. Cozy, spicy-sweet and utterly unique.", 46, 9, false, 4),
  P("Magnolia Dawn", "Floral", "Women", "Magnolia Petals", "Magnolia, Water Lily", "Blond Musk", "First light through magnolia trees. Dewy, airy and quietly joyful.", 43, 23, false, 5),
  P("Tobacco Vanille Reserve", "Amber", "Men", "Tobacco Leaf, Spices", "Vanilla, Cacao", "Dried Fruits, Tonka", "Our reserve blend: rich tobacco leaf and cacao under a vanilla haze. Pure evening luxury.", 88, 5, false, 6),
  P("Bergamot Noir", "Citrus", "Men", "Bergamot, Black Tea", "Juniper, Leather", "Smoked Woods", "Citrus after dark. Bergamot and black tea over a leathery, smoky base.", 57, 14, false, 7),
  P("Sacred Frankincense", "Oud", "Unisex", "Frankincense, Pine", "Myrrh, Labdanum", "Benzoin, Cedar", "Cathedral incense and ancient resin trails. Meditative, sacred, unforgettable.", 79, 8, false, 8),
  P("Pear & Freesia Garden", "Floral", "Women", "King William Pear", "Freesia, Rose", "Patchouli, Musk", "Ripe pear over a freesia garden. Fresh, fruity-floral and endlessly charming.", 44, 27, false, 9),
];

const reviewPool = [
  { rating: 5, text: "Lasted the entire workday and then some — easily 9 hours on skin. Got two compliments before lunch." },
  { rating: 5, text: "Blind bought this from the description and it is exactly as described. The dry-down is beautiful." },
  { rating: 4, text: "Lovely scent, projects well for the first 3 hours. Wish the bottle was bigger." },
  { rating: 5, text: "My signature now. Three people asked what I was wearing at a wedding." },
  { rating: 4, text: "Opening spray is quite strong for the first ten minutes, then it settles into something gorgeous." },
  { rating: 5, text: "Bought the 30ml, came back for the 100ml within a month. Enough said." },
  { rating: 3, text: "Nice but a little too soft on my skin. Service and delivery were excellent though." },
  { rating: 5, text: "Smells three times its price. Packaging felt like opening a gift." },
];
const names = ["Ayesha K.", "James W.", "Fatima R.", "Daniel M.", "Priya S.", "Oliver T.", "Zainab A.", "Emma L.", "Ahmed S.", "Sophie B.", "Ryan C.", "Meera N."];

const reviews = [];
products.slice(0, 18).forEach((p, pi) => {
  const n = 3 + (pi % 3);
  for (let i = 0; i < n; i++) {
    const r = reviewPool[(pi * 2 + i) % reviewPool.length];
    reviews.push({ id: `rev-${pi}-${i}`, productId: p.id, author: names[(pi + i * 3) % names.length], rating: r.rating, text: r.text, date: new Date(Date.now() - (i * 5 + pi) * 864e5).toISOString() });
  }
});

const statuses = ["Delivered", "Shipped", "Packed", "Delivered", "Delivered", "Shipped", "Delivered", "Placed", "Delivered", "Shipped"];
const customers = [
  { name: "Ayesha Khan", email: "ayesha@example.com" }, { name: "James Wilson", email: "james@example.com" },
  { name: "Fatima Raza", email: "fatima@example.com" }, { name: "Daniel Moore", email: "daniel@example.com" },
  { name: "Priya Sharma", email: "priya@example.com" }, { name: "Oliver Twist", email: "oliver@example.com" },
  { name: "Emma Lewis", email: "emma@example.com" }, { name: "Ryan Clark", email: "ryan@example.com" },
];
const orders = statuses.map((st, i) => {
  const p1 = products[(i * 3) % products.length], p2 = products[(i * 3 + 7) % products.length];
  const items = [
    { productId: p1.id, name: p1.name, size: "50ml", qty: 1, price: p1.variants[1].price },
    ...(i % 3 === 0 ? [{ productId: p2.id, name: p2.name, size: "30ml", qty: 1, price: p2.variants[0].price }] : []),
  ];
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  return {
    id: "MN-" + (10240 + i * 7), email: customers[i % customers.length].email, customer: customers[i % customers.length].name,
    items, subtotal, shipping: subtotal > 75 ? 0 : 6, total: subtotal + (subtotal > 75 ? 0 : 6),
    status: st, address: { city: ["London", "New York", "Manchester", "Chicago", "Birmingham"][i % 5], country: i % 2 ? "USA" : "UK", line: "Demo address" },
    createdAt: new Date(Date.now() - i * 2.3 * 864e5).toISOString(),
  };
});

const policies = [
  { title: "Shipping", content: "We ship worldwide within 24 hours of ordering. UK delivery 2-3 working days (£4.95, free over £60). USA delivery 4-6 working days ($6, free over $75). Orders placed before 2pm ship the same day." },
  { title: "Returns", content: "Unopened products can be returned within 30 days for a full refund. If a fragrance is not for you, our Scent Guarantee lets you exchange an opened bottle (used less than 20%) within 14 days for store credit." },
  { title: "Authenticity", content: "Every Maison Noor fragrance is blended and bottled in-house in small batches. All attars are 100% alcohol-free pure perfume oils. Perfume sprays use premium perfumer's alcohol and 18-22% fragrance concentration (eau de parfum strength)." },
  { title: "Payments", content: "We accept Visa, Mastercard, Amex and Apple Pay via Stripe. All payments are secure; demo checkout uses Stripe test mode (use card 4242 4242 4242 4242)." },
];

// Admin demo user: admin@maisonnoor.com / admin123 — customer demo: demo@maisonnoor.com / demo1234
module.exports = { products, reviews, orders, policies };
