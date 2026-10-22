import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import { Toast, PageWrap } from "./components/bits";
import { api } from "./lib/api";
import { useStore } from "./store/useStore";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Track from "./pages/Track";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// wishlist lives on the server per user — pull it in whenever someone logs in
function useWishlistSync() {
  const user = useStore(s => s.user);
  useEffect(() => {
    if (!user || !localStorage.getItem("mn-token")) return;
    api("/users/wishlist").then(data => {
      const merged = [...new Set([...(data.wishlist || []), ...useStore.getState().wishlist])];
      useStore.setState({ wishlist: merged });
      if (merged.length !== (data.wishlist || []).length) {
        api("/users/wishlist", { method: "POST", body: { action: "set", wishlist: merged } }).catch(() => {});
      }
    }).catch(() => {});
  }, [user?.id]);
}

function Shell() {
  const location = useLocation();
  const toast = useStore(s => s.toast);
  useWishlistSync();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageWrap key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<Track />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrap>
      </div>
      <Footer />
      <ChatWidget />
      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
