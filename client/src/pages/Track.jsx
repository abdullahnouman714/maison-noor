import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, money } from "../lib/api";

const STEPS = ["Placed", "Packed", "Shipped", "Delivered"];
export default function Track() {
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get("id") || ""); const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null); const [err, setErr] = useState("");
  async function go(e) { e?.preventDefault(); setErr("");
    try { setOrder(await api(`/orders/track?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`)); }
    catch { setOrder(null); setErr("Order not found — check the ID and email from your confirmation."); } }
  const idx = order ? STEPS.indexOf(order.status) : -1;
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center"><p className="tracking-[0.3em] uppercase text-[#b08d57] text-xs font-semibold">Order Tracking</p>
      <h1 className="font-display text-4xl mt-2">Where is my order?</h1>
      <p className="text-sm text-[#78716c] mt-2">Demo IDs to try: MN-10240, MN-10247, MN-10254 (email optional)</p></div>
      <form onSubmit={go} className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow mt-8 space-y-3">
        <input value={id} onChange={e => setId(e.target.value)} placeholder="Order ID — e.g. MN-10240" className="w-full border border-[#e5dcc8] rounded-xl px-4 py-3 text-sm" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full border border-[#e5dcc8] rounded-xl px-4 py-3 text-sm" />
        <button className="w-full bg-[#1c1917] text-white py-3 rounded-full hover:bg-[#b08d57] transition text-sm font-medium">Track Order</button>
        {err && <p className="text-sm text-red-700">{err}</p>}
      </form>
      {order && <div className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow mt-6">
        <div className="flex flex-wrap justify-between gap-2"><div><span className="font-display text-xl">{order.id}</span><span className="text-sm text-[#78716c]"> · {order.customer}</span></div><span className="font-semibold">{money(order.total)}</span></div>
        <div className="flex items-center mt-7 mb-2">
          {STEPS.map((s, i) => <div key={s} className="flex-1 flex flex-col items-center relative">
            {i > 0 && <div className={`absolute top-[13px] right-1/2 w-full h-[3px] ${i <= idx ? "bg-[#b08d57]" : "bg-[#e5dcc8]"}`} />}
            <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs ${i <= idx ? "bg-[#b08d57] text-white" : "bg-[#f3ecdf] text-[#a8a29e]"}`}>{i <= idx ? "✓" : i + 1}</div>
            <span className={`text-[11px] mt-2 tracking-wide ${i <= idx ? "font-semibold" : "text-[#a8a29e]"}`}>{s}</span></div>)}
        </div>
        <div className="border-t border-[#f3ecdf] mt-5 pt-4 space-y-1.5 text-sm text-[#44403c]">
          {order.items.map((it, i) => <div key={i} className="flex justify-between"><span>{it.name} ({it.size}) × {it.qty}</span><span>{money(it.price * it.qty)}</span></div>)}
          <p className="text-xs text-[#a8a29e] pt-2">Ordered {new Date(order.createdAt).toLocaleDateString()} · Delivering to {order.address?.city}, {order.address?.country}</p>
        </div>
      </div>}
    </main>
  );
}
