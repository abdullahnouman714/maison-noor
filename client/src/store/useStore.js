import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(persist((set, get) => ({
  toast: null,
  showToast: (msg) => { set({ toast: msg }); setTimeout(() => { if (get().toast === msg) set({ toast: null }); }, 2400); },
  cart: [], // {productId, name, size, price, qty, image}
  wishlist: [],
  user: null, token: null,
  addToCart: (item) => set((s) => {
    const found = s.cart.find(c => c.productId === item.productId && c.size === item.size);
    if (found) return { cart: s.cart.map(c => c === found ? { ...c, qty: c.qty + item.qty } : c) };
    return { cart: [...s.cart, item] };
  }),
  removeFromCart: (productId, size) => set((s) => ({ cart: s.cart.filter(c => !(c.productId === productId && c.size === size)) })),
  setQty: (productId, size, qty) => set((s) => ({ cart: s.cart.map(c => c.productId === productId && c.size === size ? { ...c, qty: Math.max(1, qty) } : c) })),
  clearCart: () => set({ cart: [] }),
  toggleWish: (id) => set((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter(w => w !== id) : [...s.wishlist, id] })),
  setAuth: (user, token) => { localStorage.setItem("mn-token", token); set({ user, token }); },
  logout: () => { localStorage.removeItem("mn-token"); set({ user: null, token: null, cart: [] }); },
  cartCount: () => get().cart.reduce((s, c) => s + c.qty, 0),
  cartTotal: () => get().cart.reduce((s, c) => s + c.qty * c.price, 0),
}), { name: "maison-noor-store", partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist, user: s.user, token: s.token }) }));
