import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, money } from "../lib/api";
import { useStore } from "../store/useStore";
import { Stars, fadeUp, Img } from "../components/bits";

export default function Product() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [variant, setVariant] = useState(1);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [summary, setSummary] = useState(null);
  const [added, setAdded] = useState(false);
  const [revText, setRevText] = useState(""); const [revRating, setRevRating] = useState(5); const [revMsg, setRevMsg] = useState("");
  const addToCart = useStore(s => s.addToCart);
  const showToast = useStore(s => s.showToast);
  const user = useStore(s => s.user);

  useEffect(() => {
    api("/products/" + slug).then(d => { setP(d); setVariant(d.variants.length > 1 ? 1 : 0); }).catch(() => {});
    setSummary(null);
  }, [slug]);
  useEffect(() => { if (p) api("/ai/products/" + p.id + "/summary").then(setSummary).catch(() => {}); }, [p?.id]);

  if (!p) return <main className="max-w-5xl mx-auto px-6 py-24 text-center text-[#78716c] animate-pulse">Loading fragrance…</main>;
  const v = p.variants[variant];

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api(`/products/${p.id}/reviews`, { method: "POST", body: { rating: revRating, text: revText } });
      setRevMsg("Thanks — your review was published."); setRevText("");
      const d = await api("/products/" + slug); setP(d);
    } catch (err) { setRevMsg(err.message); }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/shop" className="text-sm text-[#78716c] hover:text-[#b08d57]">← Back to Shop</Link>
      <div className="grid lg:grid-cols-2 gap-10 mt-5">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="rounded-[2rem] overflow-hidden card-shadow shine">
            <motion.div key={img} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Img src={p.images[img]} alt={p.name} className="w-full h-[420px] sm:h-[520px] object-cover" />
            </motion.div>
          </div>
          <div className="flex gap-3 mt-3">
            {p.images.map((src, i) => <button key={i} onClick={() => setImg(i)} className={`rounded-xl overflow-hidden border-2 transition ${img === i ? "border-[#b08d57] scale-[1.03]" : "border-transparent opacity-70 hover:opacity-100"}`}><Img src={src} alt="" className="w-20 h-20 object-cover" /></button>)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <p className="tracking-[0.3em] uppercase text-[#b08d57] text-xs font-semibold">{p.scentFamily} · {p.gender} · {p.brandLine}</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-3">{p.name}</h1>
          <div className="flex items-center gap-2 mt-3"><Stars value={p.ratingAvg} size={17} /><span className="text-sm text-[#78716c]">{p.ratingAvg}/5 · {p.ratingCount} verified reviews</span></div>

          {summary && <div className="mt-5 bg-[#f3ecdf] border border-[#e5dcc8] rounded-2xl px-5 py-4 text-sm leading-relaxed">
            <span className="text-[#b08d57] font-semibold tracking-wide text-xs uppercase">✦ AI Review Summary · </span>{summary.summary}</div>}

          <p className="mt-5 text-[#44403c] leading-relaxed">{p.description}</p>

          <div className="grid grid-cols-3 gap-3 mt-6 text-center">
            {[["Top Notes", p.notes.top], ["Heart Notes", p.notes.heart], ["Base Notes", p.notes.base]].map(([t, n]) => (
              <div key={t} className="bg-white border border-[#efe7d8] rounded-2xl py-4 px-2 card-shadow"><div className="text-[11px] tracking-widest uppercase text-[#b08d57] font-semibold">{t}</div><div className="text-sm mt-1.5 font-medium">{n}</div></div>
            ))}
          </div>

          <div className="mt-7">
            <p className="text-xs tracking-widest uppercase text-[#78716c] mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {p.variants.map((vr, i) => (
                <button key={vr.size} onClick={() => setVariant(i)} className={`px-5 py-2.5 rounded-full border text-sm transition ${i === variant ? "bg-[#1c1917] text-white border-[#1c1917]" : "border-[#e5dcc8] bg-white hover:border-[#b08d57]"}`}>
                  {vr.size} · {money(vr.price)}{vr.stock <= 5 ? " · only " + vr.stock + " left" : ""}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-7 flex-wrap">
            <div className="flex items-center border border-[#e5dcc8] rounded-full bg-white overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3">−</button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-3">+</button>
            </div>
            <span className="font-display text-3xl">{money(v.price * qty)}</span>
            <button disabled={v.stock === 0} onClick={() => { addToCart({ productId: p.id, name: p.name, size: v.size, price: v.price, qty, image: p.images[0] }); showToast(`${p.name} (${v.size}) added to cart`); setAdded(true); setTimeout(() => setAdded(false), 1800); }}
              className="flex-1 min-w-[180px] bg-[#1c1917] text-white py-3.5 rounded-full font-medium hover:bg-[#b08d57] transition disabled:opacity-40">
              {added ? "✓ Added to Cart" : v.stock === 0 ? "Out of Stock" : "Add to Cart"}</button>
          </div>
          <p className="text-xs text-[#78716c] mt-4">Free shipping over $75 · Ships within 24h · 30-day returns · Alcohol-free options in the Attar range</p>
        </motion.div>
      </div>

      {/* REVIEWS */}
      <section className="mt-16 grid lg:grid-cols-[1fr_380px] gap-8">
        <motion.div {...fadeUp}>
          <h2 className="font-display text-3xl">Customer Reviews</h2>
          <div className="space-y-4 mt-6">
            {p.reviews?.length ? p.reviews.map(r => (
              <div key={r.id} className="bg-white border border-[#efe7d8] rounded-2xl p-5 card-shadow">
                <div className="flex items-center justify-between"><span className="font-medium">{r.author}</span><Stars value={r.rating} /></div>
                <p className="text-sm text-[#44403c] mt-2 leading-relaxed">{r.text}</p>
                <p className="text-xs text-[#a8a29e] mt-2">{new Date(r.date).toLocaleDateString()} · Verified purchase</p>
              </div>)) : <p className="text-[#78716c] text-sm">No reviews yet.</p>}
          </div>
        </motion.div>
        <motion.div {...fadeUp} className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow h-fit">
          <h3 className="font-display text-xl">Write a review</h3>
          {user ? <form onSubmit={submitReview} className="mt-4 space-y-3">
            <select value={revRating} onChange={e => setRevRating(+e.target.value)} className="w-full border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm bg-white">
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
            </select>
            <textarea value={revText} onChange={e => setRevText(e.target.value)} required rows="4" placeholder="How did it wear on you?" className="w-full border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm" />
            <button className="w-full bg-[#1c1917] text-white py-2.5 rounded-full text-sm hover:bg-[#b08d57] transition">Publish Review</button>
            {revMsg && <p className="text-xs text-[#78716c]">{revMsg}</p>}
            <p className="text-[11px] text-[#a8a29e]">Only customers who bought this fragrance can review it.</p>
          </form> : <p className="text-sm text-[#78716c] mt-3">Please <Link to="/login" className="text-[#b08d57] font-medium">login</Link> to write a review.</p>}
        </motion.div>
      </section>
    </main>
  );
}
