import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { api, money } from "../lib/api";
import { useStore } from "../store/useStore";
import { Img } from "./bits";

// small helper: **bold** segments inside Noor's replies
function renderText(text) {
  return text.split("\n").map((line, i) => (
    <p key={i} className="mb-1 last:mb-0">
      {line.split("**").map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}
    </p>
  ));
}

const SUGGESTIONS = ["Gift for my father", "Light office scent under $60", "Add Midnight Oud to cart", "Track order MN-10240", "Return policy?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Assalam-o-Alaikum, I'm Noor ✦ I can recommend a fragrance, add it to your cart, track your order, or explain shipping & returns. Try: \"a light office scent under $60\"" },
  ]);
  const [sessionId] = useState(() => "web-" + Math.random().toString(36).slice(2, 9));
  const addToCart = useStore(s => s.addToCart);
  const showToast = useStore(s => s.showToast);

  // scroll ONLY the message list — never the page behind it
  const listRef = useRef(null);
  useEffect(() => {
    const box = listRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setMessages(prev => [...prev, { role: "user", text: message }]);
    try {
      const out = await api("/ai/chat", { method: "POST", body: { message, sessionId } });
      // if Noor added something to the cart, mirror it in the store + toast it
      (out.actions || []).forEach(action => {
        if (action.type === "ADD_TO_CART") {
          addToCart(action.item);
          showToast(`${action.item.name} added to cart by Noor`);
        }
      });
      setMessages(prev => [...prev, { role: "ai", text: out.reply, products: out.products || [], tools: out.toolsUsed || [] }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "The assistant needs the API server running (in the server folder: npm run dev). Everything else in the shop still works." }]);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault(); // stop the browser doing anything else on Enter
    send();
  }

  return (
    <>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 bg-[#1c1917] text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#b08d57]/60 float-slow">
        <span className="text-[#d6ba8a] text-lg">✦</span>
        <span className="text-sm font-medium">Ask Noor — AI</span>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 26, scale: 0.97 }} transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-20 right-4 sm:right-5 z-50 w-[calc(100vw-2rem)] max-w-sm h-[560px] max-h-[78vh] bg-white rounded-3xl shadow-2xl border border-[#ece2cf] flex flex-col overflow-hidden">
            <div className="bg-[#1c1917] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="font-display text-lg leading-tight">Noor — AI Assistant</div>
                <div className="text-[10px] text-[#d6ba8a] tracking-[0.22em] uppercase mt-0.5">Live catalogue · Orders · Policies</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-2xl leading-none hover:text-[#d6ba8a] transition" aria-label="Close chat">×</button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf7f1]">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={`max-w-[86%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-[#1c1917] text-white rounded-br-md" : "bg-white border border-[#ece2cf] rounded-bl-md card-shadow"}`}>
                    {renderText(m.text)}
                    {m.tools?.length > 0 && (
                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {m.tools.map(t => <span key={t} className="text-[10px] bg-[#b08d57]/15 text-[#8a6d3b] border border-[#b08d57]/30 rounded-full px-2 py-0.5 font-mono">tool: {t}()</span>)}
                      </div>
                    )}
                    {m.products?.length > 0 && (
                      <div className="mt-2.5 space-y-2">
                        {m.products.map(p => (
                          <div key={p.id} className="flex items-center gap-2.5 bg-[#faf7f1] border border-[#ece2cf] rounded-xl p-2">
                            <Img src={p.image} alt={p.name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-xs text-[#78716c]">{p.scentFamily} · from {money(p.priceFrom)}</div>
                            </div>
                            <button onClick={() => { addToCart({ productId: p.id, name: p.name, size: p.defaultSize || "30ml", price: p.priceFrom, qty: 1, image: p.image }); showToast(`${p.name} added to cart`); }}
                              className="text-xs bg-[#1c1917] text-white px-3 py-1.5 rounded-full hover:bg-[#b08d57] transition shrink-0">Add</button>
                            <Link to={`/product/${p.id}`} onClick={() => setOpen(false)} className="text-xs bg-[#b08d57] text-white px-3 py-1.5 rounded-full shrink-0">View</Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {busy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border border-[#ece2cf] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 card-shadow">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    <span className="text-xs text-[#a09a8f] ml-1.5">Noor is thinking</span>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-3 border-t border-[#ece2cf] bg-white shrink-0">
              <div className="flex gap-1.5 mb-2.5 flex-wrap">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-[11px] border border-[#e5dcc8] rounded-full px-2.5 py-1 hover:border-[#b08d57] hover:text-[#96754a] transition">{s}</button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about scents, orders, shipping…"
                  className="flex-1 border border-[#e5dcc8] rounded-full px-4 py-2.5 text-sm bg-[#faf7f1]" />
                <motion.button whileTap={{ scale: 0.93 }} type="submit" className="bg-[#1c1917] text-white rounded-full px-5 text-sm hover:bg-[#b08d57] transition-colors">Send</motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
