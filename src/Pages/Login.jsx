import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import SocialAuthModal from "../Components/SocialAuthModal";
import { notifyToast } from "../utils/cartWishlistEvents";

function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token = response.data?.token || response.data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Check role & profile details
      try {
        const profileRes = await api.get("/users/profile");
        const user = profileRes.data?.user || profileRes.data?.data?.user || profileRes.data;
        const role = (user?.role || "").toLowerCase().trim();

        if (role) {
          localStorage.setItem("user_role", role);
        }

        let saved = {};
        try {
          saved = JSON.parse(localStorage.getItem("profile") || "{}");
        } catch {
          saved = {};
        }

        localStorage.setItem(
          "profile",
          JSON.stringify({
            ...saved,
            name: user?.name || saved.name || "",
            email: user?.email || email.trim(),
            role: role || "user",
          })
        );

        notifyToast(`Welcome back, ${user?.name || "Shopper"}!`, "success");

        if (role === "admin") {
          navigate("/admin");
          return;
        }
      } catch {
        notifyToast("Signed in successfully!", "success");
      }

      navigate("/");
    } catch (err) {
      console.error("Login failure:", err);
      const msg =
        err.response?.data?.message ||
        "Invalid email or password. Please verify your credentials and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="brand-mark">M</span>
            <span className="text-xl font-black tracking-tight text-slate-900">
              My<span className="text-blue-600">Store</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your email and password to access your cart, wishlist, and orders.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Min 6 characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6 text-center text-xs text-slate-400">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-2 uppercase tracking-wider text-[10px]">
              Or sign in with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSocialProvider("google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialProvider("apple")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>Apple ID</span>
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <SocialAuthModal
        provider={socialProvider}
        isOpen={Boolean(socialProvider)}
        onClose={() => setSocialProvider(null)}
        onSuccess={() => {
          setSocialProvider(null);
          navigate("/");
        }}
      />
    </main>
  );
}
