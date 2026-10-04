import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/users/register", { name: email.split("@")[0] || "Customer", email, password });
      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account. Please try again.");
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8 sm:px-6"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-2 shadow-[0_24px_70px_rgb(32_32_22/18%)] lg:grid-cols-[1fr_1fr]">
    <section className="relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-7 text-[#202016] sm:p-9 lg:min-h-[560px] lg:p-10"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl" /><div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#a48500]/25 blur-3xl" /><div className="relative"><span className="text-3xl font-black">✦</span><p className="mt-2 max-w-xs text-[10px] font-medium leading-4 text-[#514810]">Create your account and keep everything you love in one place.</p></div><div className="relative"><p className="text-xs font-medium text-[#514810]">You can easily</p><h1 className="mt-2 max-w-xs text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl">Get access to your personal<br />hub for clarity and<br />productivity</h1></div></section>

        <section className="flex items-center p-7 sm:p-10 lg:p-12"><div className="w-full max-w-sm"><div className="mb-6"><span className="text-2xl font-black text-[#a48500]">✦</span><h2 className="mt-3 text-2xl font-black tracking-tight text-[#202016]">Create an account</h2><p className="mt-2 text-[11px] leading-4 text-slate-500">Access your favorites, orders, and new finds anytime—<br className="hidden sm:block" />anywhere—and keep everything in one place.</p></div>{error && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}<form onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="register-email" className="mb-1.5 block text-[11px] font-bold text-[#202016]">Your email</label><input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]" required /></div><div><label htmlFor="register-password" className="mb-1.5 block text-[11px] font-bold text-[#202016]">Password</label><input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" minLength="6" className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]" required /></div><button type="submit" className="w-full rounded-md bg-[#e7b900] px-4 py-3 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white">Get started</button></form><div className="my-5 flex items-center gap-3 text-[9px] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with<span className="h-px flex-1 bg-slate-200" /></div><div className="flex gap-3"><button type="button" className="flex-1 rounded-md bg-slate-100 py-2 text-[10px] font-bold text-slate-700">Google</button><button type="button" className="flex-1 rounded-md bg-slate-100 py-2 text-[10px] font-bold text-slate-700">Apple</button><button type="button" className="flex-1 rounded-md bg-slate-100 py-2 text-[10px] font-bold text-slate-700">Facebook</button></div><p className="mt-5 text-center text-[10px] text-slate-500">Already have an account? <Link to="/login" className="font-bold text-[#a48500]">Sign in</Link></p></div></section>
  </div></main>;
}

export default Register;
