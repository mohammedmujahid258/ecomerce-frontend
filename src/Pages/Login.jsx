import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const THEMES = {
  yellow: {
    id: "yellow",
    label: "Brand Yellow",
    dot: "bg-[#e7b900]",
    pageBg: "bg-[#fff7d6]",
    bannerBg: "bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6]",
    blob1: "bg-white/35",
    blob2: "bg-[#a48500]/25",
    bannerText: "text-[#202016]",
    bannerSubText: "text-[#514810]",
    starColor: "text-[#202016]",
    accentStar: "text-[#a48500]",
    accentTitle: "text-[#202016]",
    accentButton: "bg-[#e7b900] text-[#202016] hover:bg-[#202016] hover:text-white",
    accentShadow: "shadow-sm",
    focusBorder: "focus:border-[#e7b900]",
    focusRing: "focus:ring-[#fff0a8]",
    linkText: "text-[#a48500] hover:text-[#e7b900]",
  },
  indigo: {
    id: "indigo",
    label: "Electric Indigo (From Screenshot)",
    dot: "bg-[#4f46e5]",
    pageBg: "bg-[#eef1fd]",
    bannerBg: "bg-gradient-to-br from-[#4f46e5] via-[#241285] to-[#7952ff]",
    blob1: "bg-[#38bdf8]/35",
    blob2: "bg-[#c084fc]/40",
    bannerText: "text-white",
    bannerSubText: "text-white/80",
    starColor: "text-white",
    accentStar: "text-[#4f46e5]",
    accentTitle: "text-slate-900",
    accentButton: "bg-[#4f46e5] text-white hover:bg-[#1e1b4b]",
    accentShadow: "shadow-[0_10px_22px_rgba(79,70,229,0.32)]",
    focusBorder: "focus:border-[#4f46e5]",
    focusRing: "focus:ring-[#e0e7ff]",
    linkText: "text-[#4f46e5] hover:text-[#3730a3]",
  },
  emerald: {
    id: "emerald",
    label: "Emerald Green",
    dot: "bg-[#059669]",
    pageBg: "bg-[#ecfdf5]",
    bannerBg: "bg-gradient-to-br from-[#059669] via-[#064e3b] to-[#10b981]",
    blob1: "bg-[#34d399]/35",
    blob2: "bg-[#a7f3d0]/30",
    bannerText: "text-white",
    bannerSubText: "text-white/80",
    starColor: "text-white",
    accentStar: "text-[#059669]",
    accentTitle: "text-slate-900",
    accentButton: "bg-[#059669] text-white hover:bg-[#022c22]",
    accentShadow: "shadow-[0_10px_22px_rgba(5,150,105,0.32)]",
    focusBorder: "focus:border-[#059669]",
    focusRing: "focus:ring-[#d1fae5]",
    linkText: "text-[#059669] hover:text-[#047857]",
  },
  ocean: {
    id: "ocean",
    label: "Ocean Blue",
    dot: "bg-[#0284c7]",
    pageBg: "bg-[#f0f9ff]",
    bannerBg: "bg-gradient-to-br from-[#0284c7] via-[#0c4a6e] to-[#38bdf8]",
    blob1: "bg-[#67e8f9]/35",
    blob2: "bg-[#bae6fd]/30",
    bannerText: "text-white",
    bannerSubText: "text-white/80",
    starColor: "text-white",
    accentStar: "text-[#0284c7]",
    accentTitle: "text-slate-900",
    accentButton: "bg-[#0284c7] text-white hover:bg-[#082f49]",
    accentShadow: "shadow-[0_10px_22px_rgba(2,132,199,0.32)]",
    focusBorder: "focus:border-[#0284c7]",
    focusRing: "focus:ring-[#e0f2fe]",
    linkText: "text-[#0284c7] hover:text-[#0369a1]",
  },
  rose: {
    id: "rose",
    label: "Sunset Rose",
    dot: "bg-[#e11d48]",
    pageBg: "bg-[#fff1f2]",
    bannerBg: "bg-gradient-to-br from-[#e11d48] via-[#881337] to-[#fb7185]",
    blob1: "bg-[#fda4af]/35",
    blob2: "bg-[#fecdd3]/30",
    bannerText: "text-white",
    bannerSubText: "text-white/80",
    starColor: "text-white",
    accentStar: "text-[#e11d48]",
    accentTitle: "text-slate-900",
    accentButton: "bg-[#e11d48] text-white hover:bg-[#4c0519]",
    accentShadow: "shadow-[0_10px_22px_rgba(225,29,72,0.32)]",
    focusBorder: "focus:border-[#e11d48]",
    focusRing: "focus:ring-[#ffe4e6]",
    linkText: "text-[#e11d48] hover:text-[#be123c]",
  },
  midnight: {
    id: "midnight",
    label: "Midnight Slate",
    dot: "bg-[#0f172a]",
    pageBg: "bg-[#f8fafc]",
    bannerBg: "bg-gradient-to-br from-[#334155] via-[#0f172a] to-[#475569]",
    blob1: "bg-[#94a3b8]/35",
    blob2: "bg-[#cbd5e1]/30",
    bannerText: "text-white",
    bannerSubText: "text-white/80",
    starColor: "text-white",
    accentStar: "text-[#0f172a]",
    accentTitle: "text-slate-900",
    accentButton: "bg-[#0f172a] text-white hover:bg-[#334155]",
    accentShadow: "shadow-[0_10px_22px_rgba(15,23,42,0.32)]",
    focusBorder: "focus:border-[#0f172a]",
    focusRing: "focus:ring-[#e2e8f0]",
    linkText: "text-[#0f172a] hover:text-[#475569]",
  },
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [themeKey, setThemeKey] = useState("yellow");
  const navigate = useNavigate();

  const currentTheme = THEMES[themeKey] || THEMES.yellow;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.token || response.data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <main className={`relative flex min-h-screen items-center justify-center ${currentTheme.pageBg} px-4 py-8 sm:px-6 transition-colors duration-300`}>
      {/* Interactive Theme Color Options */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 shadow-md backdrop-blur-md">
        <span className="text-[11px] font-bold text-slate-700">Color:</span>
        <div className="flex items-center gap-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setThemeKey(t.id)}
              className={`h-5 w-5 rounded-full ${t.dot} transition-transform duration-200 cursor-pointer ${
                themeKey === t.id
                  ? "scale-125 ring-2 ring-slate-900 ring-offset-2 shadow-sm"
                  : "opacity-75 hover:opacity-100 hover:scale-110"
              }`}
              title={t.label}
              aria-label={t.label}
            />
          ))}
        </div>
      </div>

      {/* Main Split-Card Container */}
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-2 shadow-[0_24px_70px_rgb(32_32_22/18%)] lg:grid-cols-[1fr_1fr]">
        {/* Left Section: Gradient Banner */}
        <section className={`relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-2xl ${currentTheme.bannerBg} p-7 ${currentTheme.bannerText} sm:p-9 lg:min-h-[440px] lg:p-10 transition-colors duration-300`}>
          <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full ${currentTheme.blob1} blur-3xl`} />
          <div className={`absolute -bottom-20 -left-20 h-64 w-64 rounded-full ${currentTheme.blob2} blur-3xl`} />

          <div className="relative">
            <span className={`text-3xl font-black ${currentTheme.starColor}`}>✦</span>
          </div>

          <div className="relative">
            <p className={`text-xs font-medium ${currentTheme.bannerSubText}`}>You can easily</p>
            <h1 className="mt-2 max-w-xs text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl">
              Get access your personal<br />hub for clarity and<br />productivity
            </h1>
          </div>
        </section>

        {/* Right Section: Login Form */}
        <section className="flex items-center p-7 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <span className={`text-2xl font-black ${currentTheme.accentStar}`}>✦</span>
              <h2 className={`mt-3 text-2xl font-black tracking-tight ${currentTheme.accentTitle}`}>
                Log in to your account
              </h2>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Access your tasks, notes, and projects anytime—<br className="hidden sm:block" />
                anywhere—and keep everything flowing in one place.
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-[11px] font-bold text-[#202016]">
                  Your email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="farzahaidari786@gmail.com"
                  className={`w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none ${currentTheme.focusBorder} focus:ring-2 ${currentTheme.focusRing}`}
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-[11px] font-bold text-[#202016]">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••"
                  className={`w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none ${currentTheme.focusBorder} focus:ring-2 ${currentTheme.focusRing}`}
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full rounded-md ${currentTheme.accentButton} ${currentTheme.accentShadow} px-4 py-3 text-xs font-black transition`}
              >
                Get Started
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[9px] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or continue with
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-md bg-slate-100 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Google
              </button>
              <button
                type="button"
                className="flex-1 rounded-md bg-slate-100 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Apple
              </button>
              <button
                type="button"
                className="flex-1 rounded-md bg-slate-100 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Facebook
              </button>
            </div>

            <p className="mt-5 text-center text-[10px] text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className={`font-bold ${currentTheme.linkText}`}>
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;