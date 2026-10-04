import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

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

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AppleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.13.64-2.81 1.43-.54.63-1.02 1.66-.89 2.69 1.07.08 2.08-.5 2.69-1.25z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function Login() {
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

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.token || response.data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Check user role
      try {
        const profileRes = await api.get("/users/profile");
        const role = profileRes.data?.user?.role || profileRes.data?.role;
        if (role === "admin") {
          navigate("/admin");
          return;
        }
      } catch {
        // Fall back to home
      }

      navigate("/");
    } catch (requestError) {
      const msg =
        requestError.response?.data?.message ||
        "Invalid email or password. Please try again.";
      if (msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-2 shadow-[0_24px_70px_rgb(32_32_22/18%)] lg:grid-cols-[1fr_1fr]">
        {/* Left Section: Golden Mesh Banner */}
        <section className="relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-7 text-[#202016] sm:p-9 lg:min-h-[460px] lg:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#a48500]/25 blur-3xl" />

          <div className="relative">
            <span className="text-3xl font-black">✦</span>
          </div>

          <div className="relative">
            <p className="text-xs font-medium text-[#514810]">You can easily</p>
            <h1 className="mt-2 max-w-xs text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl">
              Get access to your personal<br />hub for clarity and<br />productivity
            </h1>
          </div>
        </section>

        {/* Right Section: Login Form */}
        <section className="flex items-center p-7 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <span className="text-2xl font-black text-[#a48500]">✦</span>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[#202016]">
                Log in to your account
              </h2>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Access your tasks, orders, and favorites anytime—<br className="hidden sm:block" />
                anywhere—and keep everything flowing in one place.
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-[11px] font-bold text-[#202016]"
                >
                  Your email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]"
                  required
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-bold text-[#202016]"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="••••••••••"
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
                {loading ? "Signing in..." : "Get Started"}
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
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <AppleIcon className="w-4 h-4 shrink-0 text-slate-900" />
                <span>Apple</span>
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                <FacebookIcon className="w-4 h-4 shrink-0" />
                <span>Facebook</span>
              </button>
            </div>

            <p className="mt-5 text-center text-[10px] text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-[#a48500] hover:text-[#e7b900]">
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