import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { money } from "../lib/api";
import { Stars, Img, fadeUp } from "./bits";

export default function ProductCard({ product, index = 0 }) {
  const addToCart = useStore(s => s.addToCart);
  const showToast = useStore(s => s.showToast);
  const wishlist = useStore(s => s.wishlist);
  const toggleWishBase = useStore(s => s.toggleWish);
  const wished = wishlist.includes(product.id);
  const lowestStock = Math.min(...product.variants.map(v => v.stock));

  // keep the wishlist in sync with the server when the shopper is logged in
  function toggleWish(id) {
    toggleWishBase(id);
    if (localStorage.getItem("mn-token")) {
      import("../lib/api").then(({ api }) => api("/users/wishlist", { method: "POST", body: { productId: id } }).catch(() => {}));
    }
  }

  function handleAdd() {
    const first = product.variants[0];
    addToCart({ productId: product.id, name: product.name, size: first.size, price: first.price, qty: 1, image: product.images[0] });
    showToast(`${product.name} (${first.size}) added to cart`);
  }

  return (
    <motion.article {...fadeUp} transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group bg-white rounded-3xl overflow-hidden border border-[#efe7d8] card-shadow card-lift flex flex-col">
      <div className="relative shine">
        <Link to={`/product/${product.slug}`}>
          <Img src={product.images[0]} alt={product.name} className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </Link>
        <button onClick={() => toggleWish(product.id)} aria-label="Add to wishlist"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all active:scale-90 ${wished ? "bg-[#b08d57] text-white" : "bg-white/92 text-[#1c1917] hover:bg-white shadow"}`}>
          {wished ? "♥" : "♡"}
        </button>
        {product.isFeatured && <span className="absolute top-3 left-3 z-10 bg-[#1c1917]/95 text-[#d6ba8a] text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full">Bestseller</span>}
        {lowestStock <= 5 && <span className="absolute bottom-3 left-3 z-10 bg-[#8c2f2f]/92 text-white text-[11px] px-2.5 py-1 rounded-full">Only {lowestStock} left</span>}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] tracking-[0.18em] uppercase text-[#b08d57] font-semibold">{product.scentFamily} · {product.gender}</span>
          <span className="flex items-center gap-1 shrink-0"><Stars value={product.ratingAvg} /><span className="text-xs text-[#a09a8f]">({product.ratingCount || 0})</span></span>
        </div>
        <Link to={`/product/${product.slug}`} className="font-display text-[21px] leading-snug mt-1.5 hover:text-[#96754a] transition-colors">{product.name}</Link>
        <p className="text-sm text-[#78716c] mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="text-[17px] font-semibold">from {money(product.variants[0].price)}</span>
          <motion.button whileTap={{ scale: 0.93 }} onClick={handleAdd}
            className="bg-[#1c1917] text-white text-sm px-4.5 px-4 py-2.5 rounded-full hover:bg-[#b08d57] transition-colors">
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
