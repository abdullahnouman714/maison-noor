import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1c1917] text-[#d6cdbd] mt-20 relative overflow-hidden">
      <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[#b08d57]/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-8 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl text-white">Maison <span className="gold-grad">Noor</span></div>
          <p className="text-sm mt-3 leading-relaxed">Small-batch luxury perfumes & pure attar oils, blended in-house. An AI-powered store built with the MERN stack and AI agents.</p>
          <div className="gold-divider mt-6 max-w-[180px]"><span className="text-[#b08d57] text-xs">✦</span></div>
          <div className="flex gap-2.5 mt-5">
            <a href="https://www.linkedin.com/in/abdullah-nouman-542410349" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/8 bg-white/10 hover:bg-[#0a66c2] transition-colors text-white text-xs font-medium px-3.5 py-2 rounded-full">
              <span className="font-bold">in</span> LinkedIn
            </a>
            <a href="https://github.com/abdullahnouman714" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-[#333] transition-colors text-white text-xs font-medium px-3.5 py-2 rounded-full">
              <span className="font-bold">GH</span> GitHub
            </a>
            <a href="mailto:abdullahnouman714@gmail.com"
              className="flex items-center gap-2 bg-white/10 hover:bg-[#b08d57] transition-colors text-white text-xs font-medium px-3.5 py-2 rounded-full">
              ✉ Email
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3.5">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/shop" className="hover:text-[#d6ba8a] transition">All Fragrances</Link></li>
            <li><Link to="/shop?family=Oud" className="hover:text-[#d6ba8a] transition">Oud Collection</Link></li>
            <li><Link to="/shop?family=Musk" className="hover:text-[#d6ba8a] transition">Musk & Attars</Link></li>
            <li><Link to="/shop?family=Floral" className="hover:text-[#d6ba8a] transition">Floral</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3.5">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/track" className="hover:text-[#d6ba8a] transition">Track Your Order</Link></li>
            <li>Shipping: UK 2–3 days · USA 4–6 days</li>
            <li>30-day returns on unopened items</li>
            <li>support@maisonnoor.com</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3.5">Demo Access</h4>
          <ul className="space-y-2.5 text-sm">
            <li>Customer: demo@maisonnoor.com / demo1234</li>
            <li>Admin: admin@maisonnoor.com / admin123</li>
            <li>Stripe test card: 4242 4242 4242 4242</li>
            <li>Coupon: NOOR10 for 10% off</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5 text-center text-xs px-4">
        © {new Date().getFullYear()} Maison Noor — designed & built by <span className="text-[#d6ba8a]">Abdullah Nouman</span> · <a href="mailto:abdullahnouman714@gmail.com" className="hover:text-[#d6ba8a] transition">abdullahnouman714@gmail.com</a>
      </div>
    </footer>
  );
}
