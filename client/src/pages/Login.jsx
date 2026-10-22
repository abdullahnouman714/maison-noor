import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useStore } from "../store/useStore";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(""); const setAuth = useStore(s => s.setAuth); const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  async function submit(e) { e.preventDefault(); setErr("");
    try { const out = await api("/auth/" + (mode === "login" ? "login" : "register"), { method: "POST", body: form });
      setAuth(out.user, out.token); nav(out.user.role === "admin" ? "/admin" : "/"); }
    catch (er) { setErr(er.message); } }
  const inp = "w-full border border-[#e5dcc8] rounded-xl px-4 py-3 text-sm bg-[#faf7f1]";
  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#efe7d8] rounded-[2rem] p-8 card-shadow">
        <h1 className="font-display text-3xl text-center">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-center text-sm text-[#78716c] mt-2">Demo: demo@maisonnoor.com / demo1234 · Admin: admin@maisonnoor.com / admin123</p>
        <form onSubmit={submit} className="space-y-3 mt-6">
          {mode === "register" && <input required value={form.name} onChange={set("name")} placeholder="Full name" className={inp} />}
          <input required type="email" value={form.email} onChange={set("email")} placeholder="Email" className={inp} />
          <input required type="password" value={form.password} onChange={set("password")} placeholder="Password" className={inp} />
          {err && <p className="text-sm text-red-700">{err}</p>}
          <button className="w-full bg-[#1c1917] text-white py-3.5 rounded-full hover:bg-[#b08d57] transition font-medium">{mode === "login" ? "Login" : "Register"}</button>
        </form>
        <p className="text-center text-sm mt-5 text-[#78716c]">{mode === "login" ? <>New here? <button onClick={() => setMode("register")} className="text-[#b08d57] font-medium">Create an account</button></> : <>Already registered? <button onClick={() => setMode("login")} className="text-[#b08d57] font-medium">Login</button></>}</p>
      </div>
    </main>
  );
}
