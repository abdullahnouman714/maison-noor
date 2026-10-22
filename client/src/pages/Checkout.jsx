import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { api, money } from "../lib/api";

export default function Checkout() {
  const { cart, clearCart, user } = useStore();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", line: "", city: "", country: "UK", card: "4242 4242 4242 4242" });
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(null); const [err, setErr] = useState("");
  const [couponInput, setCouponInput] = useState(""); const [coupon, setCoupon] = useState(null); const [discount, setDiscount] = useState(0); const [couponMsg, setCouponMsg] = useState("");
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = subtotal - discount > 75 || subtotal === 0 ? 0 : 6;
  const total = subtotal - discount + shipping;
  async function applyCoupon() {
    try { const out = await api("/orders/validate-coupon", { method: "POST", body: { code: couponInput, subtotal } });
      setCoupon(out.coupon); setDiscount(out.discount); setCouponMsg("Coupon applied: -" + money(out.discount)); }
    catch (e) { setCoupon(null); setDiscount(0); setCouponMsg(e.message); } }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function place(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const out = await api("/orders/create-payment-intent", { method: "POST", body: {
        items: cart.map(c => ({ productId: c.productId, size: c.size, qty: c.qty })), couponCode: coupon || undefined,
        email: form.email, name: form.name, address: { line: form.line, city: form.city, country: form.country } } });
      clearCart(); setDone(out.order);
    } catch (er) { setErr(er.message + " — is the API server running?"); }
    setBusy(false);
  }

  if (done) return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl text-[#b08d57]">✦</div>
      <h1 className="font-display text-4xl mt-4">Shukriya! Order confirmed.</h1>
      <p className="text-[#44403c] mt-4">Order <strong>{done.id}</strong> · Total <strong>{money(done.total)}</strong><br />A confirmation has been sent to {done.email}. Your fragrances ship within 24 hours.</p>
      <Link to={"/track?id=" + done.id} className="inline-block mt-7 bg-[#1c1917] text-white px-8 py-3 rounded-full hover:bg-[#b08d57] transition">Track Your Order</Link>
    </main>);

  if (!cart.length) return <main className="max-w-2xl mx-auto px-6 py-24 text-center"><h1 className="font-display text-3xl">Your cart is empty</h1><Link to="/shop" className="text-[#b08d57] underline mt-3 inline-block">Go to Shop</Link></main>;

  const inp = "w-full border border-[#e5dcc8] rounded-xl px-4 py-3 text-sm bg-white";
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl">Checkout</h1>
      <form onSubmit={place} className="grid lg:grid-cols-[1fr_320px] gap-8 mt-8">
        <div className="space-y-6">
          <section className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow space-y-3">
            <h3 className="font-display text-xl">Contact & Shipping</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={form.name} onChange={set("name")} placeholder="Full name" className={inp} />
              <input required type="email" value={form.email} onChange={set("email")} placeholder="Email" className={inp} />
            </div>
            <input required value={form.line} onChange={set("line")} placeholder="Street address" className={inp} />
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={form.city} onChange={set("city")} placeholder="City" className={inp} />
              <select value={form.country} onChange={set("country")} className={inp}><option>UK</option><option>USA</option><option>Canada</option><option>UAE</option><option>Pakistan</option></select>
            </div>
          </section>
          <section className="bg-white border border-[#efe7d8] rounded-3xl p-6 card-shadow space-y-3">
            <h3 className="font-display text-xl">Payment <span className="text-xs text-[#78716c] font-sans">(Stripe · test mode)</span></h3>
            <input value={form.card} onChange={set("card")} className={inp} />
            <div className="grid grid-cols-2 gap-3"><input placeholder="MM / YY — any future date" className={inp} /><input placeholder="CVC — any 3 digits" className={inp} /></div>
            <p className="text-xs text-[#a8a29e]">Demo checkout — with a real STRIPE_SECRET_KEY the server creates a live test PaymentIntent; the demo card 4242… always succeeds.</p>
          </section>
          {err && <p className="text-sm text-red-700">{err}</p>}
        </div>
        <div className="bg-[#1c1917] text-white rounded-3xl p-6 h-fit">
          <h3 className="font-display text-xl">Summary</h3>
          <div className="space-y-2 mt-4 text-sm text-[#d6cdbd]">
            {cart.map(c => <div key={c.productId + c.size} className="flex justify-between gap-2"><span className="truncate">{c.name} ({c.size}) × {c.qty}</span><span className="text-white">{money(c.price * c.qty)}</span></div>)}
            {discount > 0 && <div className="flex justify-between"><span>Coupon {coupon}</span><span className="text-[#d6ba8a]">-{money(discount)}</span></div>}
            <div className="border-t border-white/15 pt-3 flex justify-between"><span>Shipping</span><span className="text-white">{shipping === 0 ? "Free" : money(shipping)}</span></div>
            <div className="flex justify-between text-base"><span>Total</span><span className="font-display text-2xl text-white">{money(total)}</span></div>
          </div>
          <div className="flex gap-2 mt-6">
            <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Coupon — try NOOR10" className="flex-1 min-w-0 bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-sm placeholder:text-[#a8a29e] text-white" />
            <button type="button" onClick={applyCoupon} className="border border-[#d6ba8a] text-[#d6ba8a] rounded-full px-4 text-sm hover:bg-[#d6ba8a] hover:text-[#1c1917] transition">Apply</button>
          </div>
          {couponMsg && <p className="text-xs mt-2 text-[#d6ba8a]">{couponMsg}</p>}
          <button disabled={busy} className="w-full bg-[#b08d57] hover:bg-[#c39f66] disabled:opacity-50 text-white py-3.5 rounded-full mt-4 font-medium transition">{busy ? "Processing…" : "Pay " + money(total)}</button>
        </div>
      </form>
    </main>
  );
}
