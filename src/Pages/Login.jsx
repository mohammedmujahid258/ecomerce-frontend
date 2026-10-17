import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import SocialAuthModal from "../Components/SocialAuthModal";
import { notifyToast } from "../utils/cartWishlistEvents";

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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
  const location = useLocation();
  const destination = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
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

      // Sync user profile & role
      try {
        const profileRes = await api.get("/users/profile");
        const user =
          profileRes.data?.user || profileRes.data?.data?.user || profileRes.data;
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

      navigate(destination);
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
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-stone-200/90 bg-white shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Editorial Shopping Showcase (lg:col-span-5) */}
          <div className="hidden lg:flex lg:col-span-5 bg-stone-900 text-white p-10 lg:p-12 flex-col justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-stone-800/60 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-stone-800/40 blur-3xl pointer-events-none" />

            {/* Top Brand & Title */}
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-2 mb-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black tracking-widest text-stone-900 shadow-xs">
                  M
                </span>
                <span className="font-editorial text-lg tracking-wider text-white">
                  MYSTORE
                </span>
              </Link>

              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">
                Member Access
              </span>
              <h2 className="font-editorial text-3xl font-normal tracking-tight text-white leading-snug">
                Everyday essentials, thoughtfully selected.
              </h2>
              <p className="mt-3 text-xs text-stone-300 leading-relaxed">
                Sign in to seamlessly access your shopping bag, saved wishlist items, and past orders.
              </p>
            </div>

            {/* Center Editorial Highlight */}
            <div className="relative z-10 my-8 rounded-2xl border border-stone-800 bg-stone-800/60 p-5 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-700 text-stone-200 text-xs font-bold">
                  ✦
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">Curated Collection</p>
                  <p className="text-[11px] text-stone-400">Authentic goods & verified quality</p>
                </div>
              </div>
            </div>

            {/* Bottom Trust Features */}
            <div className="relative z-10 space-y-2.5 text-xs text-stone-400 border-t border-stone-800 pt-6">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Free delivery on orders over ₹999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Real-time shipment tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>256-bit encrypted secure checkout</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In Form (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            
            {/* Header */}
            <div>
              <Link to="/" className="inline-flex lg:hidden items-center gap-2 mb-6">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-900 text-xs font-black tracking-widest text-white">
                  M
                </span>
                <span className="font-editorial text-base tracking-wider text-stone-900">
                  MYSTORE
                </span>
              </Link>

              <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
                Sign In
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-500">
                Enter your credentials to access your account.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-xs sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Password *
                  </label>
                  <span className="text-[11px] text-stone-400">Min 6 characters</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 pr-10 text-xs sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1.5 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-full bg-stone-900 py-3.5 px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Sign In &rarr;"}
                </button>
              </div>
            </form>

            {/* Social Authentication Divider */}
            <div className="relative my-6 text-center text-xs text-stone-400">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100" />
              </div>
              <span className="relative bg-white px-3 uppercase tracking-wider text-[10px] font-semibold text-stone-400">
                Or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSocialProvider("google")}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 px-4 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition cursor-pointer"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => setSocialProvider("apple")}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 px-4 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition cursor-pointer"
              >
                <span>Apple ID</span>
              </button>
            </div>

            {/* Bottom link to Register */}
            <div className="mt-8 border-t border-stone-100 pt-5 text-center text-xs text-stone-500">
              Don&apos;t have an account yet?{" "}
              <Link
                to="/register"
                className="font-bold text-stone-900 hover:underline"
              >
                Create an account
              </Link>
            </div>

          </div>

        </div>
      </div>

      <SocialAuthModal
        provider={socialProvider}
        isOpen={Boolean(socialProvider)}
        onClose={() => setSocialProvider(null)}
        onSuccess={() => {
          setSocialProvider(null);
          navigate(destination);
        }}
      />
    </main>
  );
}
