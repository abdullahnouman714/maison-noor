import { useEffect, useRef, useState } from "react";
import { api, money } from "../lib/api";
import { useStore } from "../store/useStore";

export default function Admin() {
  const user = useStore(s => s.user);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState(""); const [chat, setChat] = useState([{ role: "ai", text: "I'm your store Copilot. I query live sales, stock and customer data. Try one of the suggestions below.", tools: [] }]);
  const [tab, setTab] = useState("dashboard");
  const [adminProducts, setAdminProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [np, setNp] = useState({ name: "", scentFamily: "Floral", price: 50, stock: 10, description: "", image: "" });
  const [nc, setNc] = useState({ code: "", value: 10, minSpend: 0 });
  const loadAdmin = () => { api("/admin/products").then(setAdminProducts).catch(() => {}); api("/admin/coupons").then(setCoupons).catch(() => {}); };
  useEffect(() => { if (user?.role === "admin") loadAdmin(); }, [user]);
  async function addProduct(e) { e.preventDefault();
    await api("/products", { method: "POST", body: { name: np.name, scentFamily: np.scentFamily, price: +np.price, stock: +np.stock, description: np.description,
      variants: [{ size: "30ml", price: Math.round(np.price * 0.7), stock: +np.stock, sku: "NEW-30" }, { size: "50ml", price: +np.price, stock: +np.stock, sku: "NEW-50" }, { size: "100ml", price: Math.round(np.price * 1.6), stock: +np.stock, sku: "NEW-100" }],
      images: np.image ? [np.image] : undefined } });
    setNp({ name: "", scentFamily: "Floral", price: 50, stock: 10, description: "", image: "" }); loadAdmin(); setStats(await api("/admin/stats")); }
  async function delProduct(id) { if (!confirm("Delete this product?")) return; await api("/products/" + id, { method: "DELETE" }); loadAdmin(); }
  async function toggleFeatured(prod) { await api("/products/" + prod.id, { method: "PUT", body: { isFeatured: !prod.isFeatured } }); loadAdmin(); }
  async function addCoupon(e) { e.preventDefault();
    await api("/admin/coupons", { method: "POST", body: { code: nc.code, type: "percent", value: +nc.value, minSpend: +nc.minSpend } });
    setNc({ code: "", value: 10, minSpend: 0 }); loadAdmin(); }
  const [busy, setBusy] = useState(false); const listRef = useRef(null);
  useEffect(() => { api("/admin/stats").then(setStats).catch(() => {}); }, []);
  useEffect(() => { const box = listRef.current; if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" }); }, [chat]);

  async function ask(text) {
    const question = (text ?? q).trim(); if (!question || busy) return;
    setQ(""); setBusy(true); setChat(c => [...c, { role: "user", text: question }]);
    try { const out = await api("/admin/ai/copilot", { method: "POST", body: { question } });
      setChat(c => [...c, { role: "ai", text: out.answer, tools: out.toolsUsed }]); }
    catch { setChat(c => [...c, { role: "ai", text: "Copilot needs the API server and an admin login.", tools: [] }]); }
    setBusy(false);
  }
  async function setStatus(id, status) { await api(`/admin/orders/${id}/status`, { method: "PUT", body: { status } }); setStats(await api("/admin/stats")); }

  if (!user || user.role !== "admin") return <main className="max-w-xl mx-auto px-6 py-24 text-center"><h1 className="font-display text-3xl">Admin access only</h1><p className="text-[#78716c] mt-3">Login with admin@maisonnoor.com / admin123 to view the dashboard & AI Copilot.</p></main>;
  if (!stats) return <main className="max-w-6xl mx-auto px-6 py-16 text-[#78716c] animate-pulse">Loading dashboard…</main>;
  const maxDay = Math.max(...stats.salesByDay.map(d => d.total), 1);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="tracking-[0.3em] uppercase text-[#b08d57] text-xs font-semibold">Maison Noor · Owner Dashboard</p>
      <h1 className="font-display text-4xl mt-2">Admin Panel</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[["Total Revenue", money(stats.revenue)], ["Orders", stats.orderCount], ["Products Live", stats.productCount], ["Low-Stock Alerts", stats.lowStock.length]].map(([t, v]) => (
          <div key={t} className="bg-[#1c1917] text-white rounded-3xl p-6"><div className="text-xs tracking-widest uppercase text-[#d6ba8a]">{t}</div><div className="font-display text-3xl mt-2">{v}</div></div>))}
      </div>

      <div className="flex gap-2 mt-8">
        {[["dashboard", "Dashboard"], ["products", "Products CRUD"], ["coupons", "Coupons"]].map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${tab === k ? "bg-[#1c1917] text-white" : "bg-white border border-[#e5dcc8] hover:border-[#b08d57]"}`}>{t}</button>))}
      </div>

      {tab === "products" && <section className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow mt-6">
        <h3 className="font-display text-xl">Products — {adminProducts.length} live</h3>
        <form onSubmit={addProduct} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <input required value={np.name} onChange={e => setNp({ ...np, name: e.target.value })} placeholder="Product name" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm" />
          <select value={np.scentFamily} onChange={e => setNp({ ...np, scentFamily: e.target.value })} className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm bg-white">{["Oud","Musk","Floral","Citrus","Amber","Woody","Fresh","Spicy"].map(f => <option key={f}>{f}</option>)}</select>
          <input type="number" value={np.price} onChange={e => setNp({ ...np, price: e.target.value })} placeholder="50ml price $" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm" />
          <input type="number" value={np.stock} onChange={e => setNp({ ...np, stock: e.target.value })} placeholder="Stock" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm" />
          <input value={np.image} onChange={e => setNp({ ...np, image: e.target.value })} placeholder="Image URL (optional)" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm lg:col-span-2" />
          <input value={np.description} onChange={e => setNp({ ...np, description: e.target.value })} placeholder="Short description" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm" />
          <button className="bg-[#1c1917] text-white rounded-xl py-2.5 text-sm hover:bg-[#b08d57] transition">+ Add Product</button>
        </form>
        <div className="mt-5 divide-y divide-[#faf5ea] max-h-[420px] overflow-y-auto">
          {adminProducts.map(prod => (
            <div key={prod.id} className="flex items-center gap-3 py-3">
              <img src={prod.images[0]} alt="" className="w-11 h-11 rounded-lg object-cover" />
              <div className="flex-1 min-w-0"><div className="font-medium truncate">{prod.name}</div><div className="text-xs text-[#78716c]">{prod.scentFamily} · from ${prod.variants[0].price} · min stock {Math.min(...prod.variants.map(v => v.stock))}</div></div>
              <button onClick={() => toggleFeatured(prod)} className={`text-xs rounded-full px-3 py-1.5 border ${prod.isFeatured ? "bg-[#b08d57] text-white border-[#b08d57]" : "border-[#e5dcc8]"}`}>{prod.isFeatured ? "★ Featured" : "☆ Feature"}</button>
              <button onClick={() => delProduct(prod.id)} className="text-xs text-red-700 border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-50">Delete</button>
            </div>))}
        </div>
      </section>}

      {tab === "coupons" && <section className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow mt-6">
        <h3 className="font-display text-xl">Discount Coupons</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {coupons.map(c => <div key={c.code} className="border border-dashed border-[#b08d57] rounded-2xl p-4 bg-[#faf7f1]">
            <div className="font-mono font-bold tracking-widest">{c.code}</div>
            <div className="text-sm text-[#78716c] mt-1">{c.type === "percent" ? c.value + "% off" : "$" + c.value + " off"} · min spend ${c.minSpend} · till {c.expiry}</div></div>)}
        </div>
        <form onSubmit={addCoupon} className="flex flex-wrap gap-3 mt-6">
          <input required value={nc.code} onChange={e => setNc({ ...nc, code: e.target.value })} placeholder="CODE" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm uppercase" />
          <input type="number" value={nc.value} onChange={e => setNc({ ...nc, value: e.target.value })} placeholder="% off" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm w-28" />
          <input type="number" value={nc.minSpend} onChange={e => setNc({ ...nc, minSpend: e.target.value })} placeholder="Min spend $" className="border border-[#e5dcc8] rounded-xl px-3 py-2.5 text-sm w-32" />
          <button className="bg-[#1c1917] text-white rounded-xl px-5 py-2.5 text-sm hover:bg-[#b08d57] transition">Create Coupon</button>
        </form>
        <p className="text-xs text-[#a8a29e] mt-3">Customers apply codes at checkout — try NOOR10 on the live store.</p>
      </section>}

      {tab === "dashboard" && <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mt-6 items-start">
        <div className="space-y-6">
          <section className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow">
            <h3 className="font-display text-xl">Sales by Day</h3>
            <div className="flex items-end gap-2 h-40 mt-5">
              {stats.salesByDay.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className="text-[10px] text-[#78716c]">{money(d.total)}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-[#b08d57] to-[#d6ba8a] transition-all duration-700" style={{ height: `${Math.max(8, (d.total / maxDay) * 110)}px` }} />
                  <span className="text-[10px] text-[#a8a29e] truncate w-full text-center">{d.date.slice(5)}</span>
                </div>))}
            </div>
          </section>

          <section className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow overflow-x-auto">
            <h3 className="font-display text-xl">Recent Orders</h3>
            <table className="w-full text-sm mt-4 min-w-[520px]">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-[#78716c] border-b border-[#f3ecdf]"><th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{stats.recentOrders.map(o => (
                <tr key={o.id} className="border-b border-[#faf5ea]"><td className="py-3 font-medium">{o.id}</td><td>{o.customer}</td><td>{money(o.total)}</td>
                  <td><select value={o.status} onChange={e => setStatus(o.id, e.target.value)} className="border border-[#e5dcc8] rounded-full px-3 py-1 text-xs bg-white">
                    {["Placed", "Packed", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}</select></td></tr>))}
              </tbody>
            </table>
          </section>

          {stats.lowStock.length > 0 && <section className="bg-red-50 border border-red-200 rounded-3xl p-6">
            <h3 className="font-display text-xl text-red-900">Low Stock — reorder soon</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-red-800">{stats.lowStock.map(x => <li key={x.name}>• {x.name} — a size is down to <strong>{x.stock}</strong></li>)}</ul>
          </section>}
        </div>

        {/* COPILOT */}
        <section className="bg-[#1c1917] text-white rounded-3xl overflow-hidden card-shadow lg:sticky lg:top-32">
          <div className="px-6 py-4 border-b border-white/10"><div className="font-display text-lg">✦ AI Copilot</div><div className="text-[11px] tracking-widest uppercase text-[#d6ba8a]">Agentic · calls live store tools</div></div>
          <div ref={listRef} className="h-[380px] overflow-y-auto p-4 space-y-3">
            {chat.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-[#b08d57] rounded-br-md" : "bg-white/10 rounded-bl-md"}`}>
                  {m.text.split("\n").map((line, j) => <p key={j} className="mb-1">{line.split("**").map((part, k) => k % 2 ? <strong key={k}>{part}</strong> : part)}</p>)}
                  {m.tools?.length > 0 && <div className="mt-2 flex gap-1.5 flex-wrap">{m.tools.map(t => <span key={t} className="text-[10px] bg-[#d6ba8a]/20 text-[#d6ba8a] border border-[#d6ba8a]/30 rounded-full px-2 py-0.5 font-mono">tool: {t}()</span>)}</div>}
                </div>
              </div>))}
            {busy && <div className="text-xs text-[#a8a29e] animate-pulse">Copilot is querying the store…</div>}
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2 flex-wrap mb-3">
              {["What were this week's sales?", "Which products are running out of stock?", "Top selling products?", "Who are my best customers?"].map(s => (
                <button key={s} onClick={() => ask(s)} className="text-[11px] border border-white/20 rounded-full px-2.5 py-1 hover:border-[#d6ba8a] hover:text-[#d6ba8a] transition">{s}</button>))}
            </div>
            <div className="flex gap-2">
              <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder="Ask about your store…" className="flex-1 bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-sm placeholder:text-[#a8a29e] text-white" />
              <button onClick={() => ask()} className="bg-[#b08d57] rounded-full px-5 text-sm hover:bg-[#c39f66] transition">Ask</button>
            </div>
          </div>
        </section>
      </div>}
    </main>
  );
}
