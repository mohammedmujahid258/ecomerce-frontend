import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function SocialIcon({ type }) {
  if (type === "Apple") return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true"><path d="M16.7 12.8c0-2.2 1.8-3.3 1.9-3.4-1-.1-2.2-1.1-3.7-1.1-1.6 0-2.4.8-3.6.8-1.2 0-2.1-.8-3.5-.8-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.1 2.7 2 .1 0 .2 0 .3-.1.8 0 1.7-.6 2.8-.6 1.1 0 1.9.6 2.9.6 1.2 0 1.9-1.1 2.6-2.1.8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3.8ZM14.3 6.8c.7-.8 1.2-1.9 1.1-3-.9 0-2 .6-2.7 1.4-.6.7-1.2 1.8-1.1 2.9 1 .1 2-.5 2.7-1.3Z" /></svg>;
  if (type === "Facebook") return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>;
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.7 2.9-4.3 2.9-7.5Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.4 13.7a6 6 0 0 1 0-3.4V7.6H3a10 10 0 0 0 0 8.8l3.4-2.7Z" /><path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3 14.7 2 12 2a10 10 0 0 0-9 5.6l3.4 2.7C7.2 7.9 9.4 6.1 12 6.1Z" /></svg>;
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordError("");

    if (!name || name.trim().length === 0) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/login");
    } catch (requestError) {
      const msg =
        requestError.response?.data?.message ||
        "Unable to create your account. Please try again.";
      if (msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8 sm:px-6"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-2 shadow-[0_24px_70px_rgb(32_32_22/18%)] lg:grid-cols-[1fr_1fr]">
    <section className="relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-7 text-[#202016] sm:p-9 lg:min-h-[560px] lg:p-10"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl" /><div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#a48500]/25 blur-3xl" /><div className="relative"><span className="text-3xl font-black">✦</span><p className="mt-2 max-w-xs text-[10px] font-medium leading-4 text-[#514810]">Create your account and keep everything you love in one place.</p></div><div className="relative"><p className="text-xs font-medium text-[#514810]">You can easily</p><h1 className="mt-2 max-w-xs text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl">Get access to your personal<br />hub for clarity and<br />productivity</h1></div></section>

        <section className="flex items-center p-7 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <span className="text-2xl font-black text-[#a48500]">✦</span>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[#202016]">
                Create an account
              </h2>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Access your favorites, orders, and new finds anytime—<br className="hidden sm:block" />
                anywhere—and keep everything in one place.
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-1.5 block text-[11px] font-bold text-[#202016]"
                >
                  Full name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-1.5 block text-[11px] font-bold text-[#202016]"
                >
                  Your email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]"
                  required
                />
              </div>

              {/* Password Input with Eye Icon and Warning */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="register-password"
                    className="block text-[11px] font-bold text-[#202016]"
                  >
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">Min 6 characters</span>
                </div>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="••••••••••"
                    minLength="6"
                    className={`w-full rounded-md border px-3 py-2.5 pr-10 text-xs outline-none transition ${
                      passwordError
                        ? "border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {passwordError && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <span className="text-xs">⚠️</span>
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#e7b900] px-4 py-3 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Creating account..." : "Get started"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[9px] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or continue with
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <SocialIcon type="Google" />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <SocialIcon type="Apple" />
                <span>Apple</span>
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <SocialIcon type="Facebook" />
                <span>Facebook</span>
              </button>
            </div>

            <p className="mt-5 text-center text-[10px] text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#a48500] hover:text-[#e7b900]">
                Sign in
              </Link>
            </p>
          </div>
        </section>
  </div></main>;
}

export default Register;
