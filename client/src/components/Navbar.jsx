import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";

export default function Navbar() {
  const cartCount = useStore(s => s.cart.reduce((sum, item) => sum + item.qty, 0));
  const user = useStore(s => s.user);
  const logout = useStore(s => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [["Home", "/"], ["Shop", "/shop"], ["Track Order", "/track"]];
  if (user?.role === "admin") links.push(["Admin", "/admin"]);

  return (
    <header className={`sticky top-0 z-40 bg-[#faf7f1]/92 backdrop-blur-md border-b border-[#ece2cf] transition-shadow ${scrolled ? "shadow-[0_8px_30px_-12px_rgba(28,25,23,0.25)]" : ""}`}>
      <div className="bg-[#1c1917] text-[#e9ded0] text-center text-[11px] sm:text-xs tracking-[0.2em] uppercase py-2 px-3">
        Complimentary shipping over $75 <span className="text-[#b08d57] mx-1">✦</span> Pure attar oils, alcohol-free
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button className="lg:hidden text-2xl leading-none" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>

        <nav className="hidden lg:flex gap-7 text-sm font-medium">
          {links.map(([label, to]) => (
            <Link key={to} to={to} className="relative hover:text-[#b08d57] transition after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-[#b08d57] after:transition-all hover:after:w-full">{label}</Link>
          ))}
        </nav>

        <Link to="/" className="font-display text-[22px] sm:text-3xl font-semibold tracking-wide flex-1 text-center lg:flex-none lg:text-left whitespace-nowrap">
          Maison <span className="gold-grad">Noor</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5 text-sm">
          {user ? (
            <>
              <span className="hidden md:block text-[#44403c]">Hi, {user.name.split(" ")[0]}</span>
              <Link to="/orders" className="hover:text-[#b08d57] hidden sm:block">My Orders</Link>
              <button onClick={() => { logout(); navigate("/"); }} className="hover:text-[#b08d57]">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-[#b08d57] font-medium">Login</Link>
          )}
          <Link to="/cart" className="relative bg-[#1c1917] text-white rounded-full px-4 py-2 hover:bg-[#b08d57] transition-colors">
            Cart
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -top-2 -right-2 bg-[#b08d57] text-white text-[11px] min-w-5 h-5 px-0.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}
            className="lg:hidden overflow-hidden border-t border-[#ece2cf] bg-[#faf7f1]">
            <div className="px-6 py-4 flex flex-col gap-3.5 text-sm font-medium">
              {links.map(([label, to]) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</Link>)}
              {user && <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
