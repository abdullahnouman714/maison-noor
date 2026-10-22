import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../lib/api";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("mn-token")) { setNeedsLogin(true); setOrders([]); return; }
    api("/orders/mine").then(setOrders).catch(() => { setNeedsLogin(true); setOrders([]); });
  }, []);
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl">My Orders</h1>
      <div className="space-y-4 mt-8">
        {orders === null && <p className="text-[#78716c] animate-pulse">Loading…</p>}
        {needsLogin && orders?.length === 0 && <div className="bg-white border border-[#efe7d8] rounded-3xl p-8 text-center card-shadow"><p className="font-display text-2xl">Please login to see your orders</p><p className="text-sm text-[#78716c] mt-2">Your order history is tied to your account.</p><Link to="/login" className="inline-block mt-5 bg-[#1c1917] text-white px-7 py-3 rounded-full hover:bg-[#b08d57] transition text-sm">Go to Login</Link></div>}
        {!needsLogin && orders?.length === 0 && <p className="text-[#78716c]">No orders yet for this account. <Link to="/shop" className="text-[#b08d57] underline">Start shopping</Link></p>}
        {orders?.map(o => (
          <div key={o.id} className="bg-white border border-[#efe7d8] rounded-2xl p-5 card-shadow flex flex-wrap gap-4 items-center justify-between">
            <div><div className="font-display text-lg">{o.id}</div>
              <div className="text-sm text-[#78716c]">{o.items.map(i => `${i.name} (${i.size})`).join(", ")}</div>
              <div className="text-xs text-[#a8a29e] mt-1">{new Date(o.createdAt).toLocaleDateString()}</div></div>
            <div className="text-right"><div className="font-semibold">{money(o.total)}</div>
              <span className="inline-block mt-1.5 text-xs bg-[#f3ecdf] border border-[#e5dcc8] rounded-full px-3 py-1">{o.status}</span>
              <Link to={"/track?id=" + o.id} className="block text-xs text-[#b08d57] mt-2 hover:underline">Track →</Link></div>
          </div>))}
      </div>
    </main>
  );
}
