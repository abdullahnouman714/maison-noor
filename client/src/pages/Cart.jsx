import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { money } from "../lib/api";

export default function Cart() {
  const { cart, setQty, removeFromCart } = useStore();
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = total === 0 || total > 75 ? 0 : 6;
  const nav = useNavigate();
  if (!cart.length) return (
    <main className="max-w-3xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl text-[#d6ba8a]">✦</div>
      <h1 className="font-display text-4xl mt-4">Your cart is empty</h1>
      <p className="text-[#78716c] mt-3">Discover a scent worth remembering.</p>
      <Link to="/shop" className="inline-block mt-7 bg-[#1c1917] text-white px-8 py-3 rounded-full hover:bg-[#b08d57] transition">Browse Fragrances</Link>
    </main>);
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl">Your Cart</h1>
      <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-8">
        <div className="space-y-4">
          {cart.map(c => (
            <div key={c.productId + c.size} className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex gap-4 items-center card-shadow">
              <img src={c.image} alt={c.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg truncate">{c.name}</div>
                <div className="text-sm text-[#78716c]">{c.size} · {money(c.price)}</div>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => setQty(c.productId, c.size, c.qty - 1)} className="w-7 h-7 rounded-full border border-[#e5dcc8]">−</button>
                  <span className="text-sm font-medium">{c.qty}</span>
                  <button onClick={() => setQty(c.productId, c.size, c.qty + 1)} className="w-7 h-7 rounded-full border border-[#e5dcc8]">+</button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{money(c.price * c.qty)}</div>
                <button onClick={() => removeFromCart(c.productId, c.size)} className="text-xs text-red-700 mt-2 hover:underline">Remove</button>
              </div>
            </div>))}
        </div>
        <div className="bg-[#1c1917] text-white rounded-3xl p-6 h-fit">
          <h3 className="font-display text-xl">Order Summary</h3>
          <div className="space-y-2.5 mt-4 text-sm text-[#d6cdbd]">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-white">{money(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-white">{shipping === 0 ? "Free" : money(shipping)}</span></div>
            {shipping > 0 && <p className="text-xs text-[#a8a29e]">Add {money(76 - total)} more for free shipping.</p>}
            <div className="border-t border-white/15 pt-3 flex justify-between text-base"><span>Total</span><span className="font-display text-2xl text-white">{money(total + shipping)}</span></div>
          </div>
          <button onClick={() => nav("/checkout")} className="w-full bg-[#b08d57] hover:bg-[#c39f66] text-white py-3.5 rounded-full mt-6 font-medium transition">Proceed to Checkout</button>
          <Link to="/shop" className="block text-center text-sm mt-4 text-[#d6cdbd] hover:text-white">Continue shopping</Link>
        </div>
      </div>
    </main>
  );
}
