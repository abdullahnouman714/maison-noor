import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// shared entrance animation for sections
export const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

// page transition wrapper (subtle fade + rise on every route change)
export function PageWrap({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

export function Stars({ value, size = 14 }) {
  const full = Math.round(value || 0);
  return (
    <span style={{ color: "#b08d57", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(full)}<span style={{ color: "#ddd2bd" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

// product photo with a graceful fallback — if the CDN image ever fails,
// the shopper sees a branded tile instead of a broken-image icon
export function Img({ src, alt, className, bare = false }) {
  const [failed, setFailed] = useState(false);
  if (failed && bare) {
    return <div className={`bg-gradient-to-br from-[#241f1b] via-[#1c1917] to-[#38302a] ${className || ""}`} />;
  }
  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2521] via-[#1c1917] to-[#3a3128] text-center ${className || ""}`}>
        <span className="text-4xl text-[#d6ba8a]">✦</span>
        <span className="font-display text-[#e9ded0] mt-2 px-3 leading-tight">{alt}</span>
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#b08d57] mt-1">Maison Noor</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}

// animated number that counts up when it scrolls into view
export function CountUp({ to, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now(), duration = 1400;
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

// little gold toast that confirms things like "added to cart"
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-[#1c1917] text-white pl-4 pr-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-[#b08d57]/60">
      <span className="w-6 h-6 rounded-full bg-[#b08d57] flex items-center justify-center text-xs">✓</span>
      <span className="text-sm whitespace-nowrap">{toast}</span>
    </motion.div>
  );
}
