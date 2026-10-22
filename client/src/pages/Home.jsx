import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { fadeUp, CountUp, Img } from "../components/bits";

const families = [
  { name: "Oud", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80", tag: "Deep · Smoky · Royal" },
  { name: "Floral", img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80", tag: "Rose · Jasmine · Peony" },
  { name: "Musk", img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80", tag: "Clean · Soft · Skin-like" },
  { name: "Amber", img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80", tag: "Warm · Golden · Cozy" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => { api("/products?featured=1").then(setFeatured).catch(() => {}); }, []);
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1c1917] text-white">
        <div className="absolute inset-0 overflow-hidden"><Img bare src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=80" alt="Luxury perfume" className="ken-burns w-full h-full object-cover opacity-45" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1917] via-[#1c1917]/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="tracking-[0.35em] uppercase text-[#d6ba8a] text-xs font-semibold">Small-batch · Est. for connoisseurs</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mt-5">
            Wear a scent<br />they <span className="gold-grad italic">remember</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 text-[#e9ded0] text-lg leading-relaxed max-w-xl">
            Luxury perfumes & pure attar oils, blended in-house — with an AI assistant that finds your signature scent from the live catalogue.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-9 flex flex-wrap gap-4">
            <Link to="/shop" className="bg-[#b08d57] hover:bg-[#c39f66] text-white px-8 py-3.5 rounded-full font-medium transition">Shop the Collection</Link>
            <a href="#families" className="border border-white/40 hover:border-[#d6ba8a] hover:text-[#d6ba8a] px-8 py-3.5 rounded-full font-medium transition">Explore Families</a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-[13px] sm:text-sm text-[#d6cdbd]">
            <div><div className="font-display text-2xl text-white"><CountUp to={30} suffix="+" /></div>Signature blends</div>
            <div><div className="font-display text-2xl text-white"><CountUp to={22} suffix="%" /></div>Parfum concentration</div>
            <div><div className="font-display text-2xl text-white">24/7</div>AI scent assistant</div>
          </motion.div>
        </div>
      </section>

      {/* scrolling brand strip */}
      <div className="bg-[#b08d57] text-white overflow-hidden py-3 select-none">
        <div className="marquee-track">
          {[0, 1].map(dup => (
            <div key={dup} className="flex shrink-0">
              {["Free shipping over $75", "Pure alcohol-free attar oils", "Blended in small batches", "30-day scent guarantee", "AI fragrance assistant — 24/7", "Ships worldwide in 24 hours"].map(text => (
                <span key={text + dup} className="flex items-center gap-3 px-6 text-[13px] tracking-[0.22em] uppercase whitespace-nowrap">{text} <span className="text-[#1c1917]/60">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FAMILIES */}
      <section id="families" className="max-w-7xl mx-auto px-6 pt-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="tracking-[0.3em] uppercase text-[#b08d57] text-xs font-semibold">The Collections</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-3">Shop by Scent Family</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10">
          {families.map((f, i) => (
            <motion.div key={f.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.55 }}>
              <Link to={`/shop?family=${f.name}`} className="group relative block rounded-3xl overflow-hidden h-64 sm:h-80">
                <Img src={f.img} alt={f.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <div className="font-display text-2xl sm:text-3xl">{f.name}</div>
                  <div className="text-xs tracking-widest uppercase text-[#d6ba8a] mt-1">{f.tag}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-6 pt-20">
        <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="tracking-[0.3em] uppercase text-[#b08d57] text-xs font-semibold">Loved worldwide</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-3">Bestsellers</h2></div>
          <Link to="/shop" className="text-sm font-medium border-b-2 border-[#b08d57] pb-0.5 hover:text-[#b08d57] transition">View all fragrances →</Link>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {featured.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          {!featured.length && <p className="text-[#78716c]">Start the API server to load products (server folder: npm run dev).</p>}
        </div>
      </section>

      {/* AI BANNER */}
      <section className="max-w-7xl mx-auto px-6 pt-20">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] bg-[#1c1917] text-white px-7 py-12 sm:p-14">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#b08d57]/25 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <p className="tracking-[0.3em] uppercase text-[#d6ba8a] text-xs font-semibold">Powered by AI Agents</p>
              <h3 className="font-display text-3xl sm:text-4xl mt-3 leading-snug">Not sure what suits you?<br />Ask <span className="gold-grad italic">Noor</span>, our AI assistant.</h3>
              <p className="text-[#d6cdbd] mt-4 leading-relaxed max-w-lg">Noor searches the live catalogue, respects your budget, explains our policies and even tracks your order — no guessing, only real store data.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-sm backdrop-blur">
              <div className="bg-white/10 rounded-xl rounded-bl-sm px-4 py-2.5 max-w-[85%]">"I need a gift for my father — something woody."</div>
              <div className="bg-[#b08d57] rounded-xl rounded-br-sm px-4 py-2.5 max-w-[85%] ml-auto">For a woody gift, Santal Royal and Royal Cambodi Oud are perfect. Shall I add Santal Royal (50ml, $94) to your cart?</div>
              <div className="text-xs text-[#a8a29e]">↑ Try it live — tap "Ask Noor" below, bottom-right.</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PROMISES */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-4">
        <div className="grid sm:grid-cols-3 gap-6">
          {[["✦", "Blended In-House", "Every fragrance is blended and bottled by Maison Noor in small batches — never mass-produced."],
            ["◈", "30-Day Returns", "Unopened items return free within 30 days, and opened bottles exchange under our Scent Guarantee."],
            ["⬢", "Ships in 24 Hours", "UK 2–3 days, USA 4–6 days. Free shipping over $75, tracked at every step."]]
            .map(([icon, t, d], i) => (
              <motion.div key={t} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-white border border-[#efe7d8] rounded-3xl p-7 card-shadow">
                <div className="text-3xl text-[#b08d57]">{icon}</div>
                <h4 className="font-display text-xl mt-3">{t}</h4><p className="text-sm text-[#78716c] mt-2 leading-relaxed">{d}</p>
              </motion.div>
            ))}
        </div>
      </section>
    </main>
  );
}
