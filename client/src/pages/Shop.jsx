import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const FAMILIES = ["Oud", "Musk", "Floral", "Citrus", "Amber", "Woody", "Fresh", "Spicy"];

export default function Shop() {
  const [params] = useSearchParams();
  const [all, setAll] = useState([]);
  const [family, setFamily] = useState(params.get("family") || "");
  const [gender, setGender] = useState("");
  const [maxPrice, setMaxPrice] = useState(130);
  const [sort, setSort] = useState("");
  const [query, setQuery] = useState("");
  const [semantic, setSemantic] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api("/products").then(d => { setAll(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  useEffect(() => { setFamily(params.get("family") || ""); }, [params]);

  async function runSemantic() {
    if (!query.trim()) return setSemantic(false);
    setLoading(true);
    try { const d = await api("/ai/search?q=" + encodeURIComponent(query)); setAll(d); setSemantic(true); }
    catch { /* keep list */ }
    setLoading(false);
  }
  async function resetSearch() { setQuery(""); setSemantic(false); setLoading(true); api("/products").then(d => { setAll(d); setLoading(false); }); }

  const list = useMemo(() => {
    let l = [...all];
    if (family) l = l.filter(p => p.scentFamily === family);
    if (gender) l = l.filter(p => p.gender === gender || p.gender === "Unisex");
    l = l.filter(p => p.variants[0].price <= maxPrice);
    if (!semantic && query) l = l.filter(p => (p.name + p.scentFamily + p.description).toLowerCase().includes(query.toLowerCase()));
    if (sort === "price-asc") l.sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === "price-desc") l.sort((a, b) => b.variants[0].price - a.variants[0].price);
    if (sort === "rating") l.sort((a, b) => b.ratingAvg - a.ratingAvg);
    return l;
  }, [all, family, gender, maxPrice, sort, query, semantic]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center">
        <p className="tracking-[0.3em] uppercase text-[#b08d57] text-xs font-semibold">The Collection</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">Shop Fragrances</h1>
        <p className="text-[#78716c] mt-3">Try natural-language search: <button className="underline decoration-[#b08d57]" onClick={() => { setQuery("gift for my father, deep woody smell"); }}>"gift for my father, deep woody smell"</button> then press AI Search ✦</p>
      </div>

      <div className="flex gap-2 max-w-2xl mx-auto mt-7">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && runSemantic()}
          placeholder="Search normally, or describe what you want…" className="flex-1 border border-[#e5dcc8] rounded-full px-5 py-3 bg-white text-sm" />
        <button onClick={runSemantic} className="bg-[#1c1917] text-white px-5 rounded-full text-sm hover:bg-[#b08d57] transition whitespace-nowrap">✦ AI Search</button>
        {(query || semantic) && <button onClick={resetSearch} className="text-sm px-3 text-[#78716c] hover:text-black">Reset</button>}
      </div>
      {semantic && <p className="text-center text-xs text-[#b08d57] mt-3 tracking-wide">Showing AI semantic matches for "{query}" — ranked by meaning, not keywords.</p>}

      <div className="grid lg:grid-cols-[230px_1fr] gap-8 mt-10">
        <aside className="bg-white border border-[#efe7d8] rounded-3xl p-6 h-fit card-shadow lg:sticky lg:top-32">
          <h3 className="font-display text-lg">Filters</h3>
          <div className="mt-4">
            <p className="text-xs tracking-widest uppercase text-[#78716c] mb-2">Scent Family</p>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              <button onClick={() => setFamily("")} className={`text-left text-sm px-3 py-1.5 rounded-full ${!family ? "bg-[#1c1917] text-white" : "hover:bg-[#f3ecdf]"}`}>All families</button>
              {FAMILIES.map(f => <button key={f} onClick={() => setFamily(f)} className={`text-left text-sm px-3 py-1.5 rounded-full ${family === f ? "bg-[#1c1917] text-white" : "hover:bg-[#f3ecdf]"}`}>{f}</button>)}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs tracking-widest uppercase text-[#78716c] mb-2">For</p>
            <div className="flex gap-1.5 flex-wrap">
              {["", "Men", "Women"].map(g => <button key={g || "all"} onClick={() => setGender(g)} className={`text-sm px-3 py-1.5 rounded-full ${gender === g ? "bg-[#1c1917] text-white" : "bg-[#f3ecdf]"}`}>{g || "Everyone"}</button>)}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs tracking-widest uppercase text-[#78716c] mb-2">Max price (30ml): ${maxPrice}</p>
            <input type="range" min="28" max="130" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} className="w-full accent-[#b08d57]" />
          </div>
          <div className="mt-5">
            <p className="text-xs tracking-widest uppercase text-[#78716c] mb-2">Sort</p>
            <select value={sort} onChange={e => setSort(e.target.value)} className="w-full border border-[#e5dcc8] rounded-xl px-3 py-2 text-sm bg-white">
              <option value="">Featured</option><option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option><option value="rating">Top rated</option>
            </select>
          </div>
        </aside>

        <section>
          {loading ? <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#efe7d8]">
                <div className="skeleton h-64" /><div className="p-5 space-y-3"><div className="skeleton h-4 rounded-full w-2/3" /><div className="skeleton h-4 rounded-full w-full" /><div className="skeleton h-9 rounded-full w-1/2" /></div>
              </div>))}</div>
            : list.length ? <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
            : <div className="text-center py-16 text-[#78716c]"><p className="font-display text-2xl text-[#1c1917]">No matches found</p><p className="text-sm mt-2">Try a different family, raise the price cap — or ask Noor, the AI assistant, to find it for you.</p></div>}
        </section>
      </div>
    </main>
  );
}
