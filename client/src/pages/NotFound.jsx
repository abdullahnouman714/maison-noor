import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-28 text-center">
      <div className="font-display text-8xl gold-grad font-bold">404</div>
      <h1 className="font-display text-3xl mt-4">This scent has evaporated</h1>
      <p className="text-[#78716c] mt-3">The page you are looking for does not exist — but plenty of beautiful fragrances do.</p>
      <Link to="/shop" className="inline-block mt-8 bg-[#1c1917] text-white px-8 py-3.5 rounded-full hover:bg-[#b08d57] transition">Browse the Collection</Link>
    </main>
  );
}
