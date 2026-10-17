import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Register() {
  const [name, setName] = useState("");
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

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Save initial profile
      localStorage.setItem(
        "profile",
        JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: "",
          image: "",
          role: "user",
        })
      );

      notifyToast("Account created successfully! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      const serverMsg = err.response?.data?.message || "";
      if (
        serverMsg.toLowerCase().includes("already") ||
        serverMsg.toLowerCase().includes("exist") ||
        err.response?.status === 409
      ) {
        setError(
          "An account with this email address already exists. Please sign in or use another email."
        );
      } else {
        setError(
          serverMsg ||
            "Unable to create your account. Please check your information and try again."
        );
      }
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
                New Customer
              </span>
              <h2 className="font-editorial text-3xl font-normal tracking-tight text-white leading-snug">
                Join our curated shopping community.
              </h2>
              <p className="mt-3 text-xs text-stone-300 leading-relaxed">
                Create an account to save curated items to your personal wishlist, enjoy streamlined checkout, and track orders.
              </p>
            </div>

            {/* Benefits Checklist */}
            <div className="relative z-10 my-8 space-y-3.5 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✦</span>
                <span>Access curated everyday essentials & limited drops</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✦</span>
                <span>Private wishlist to save your favorite products</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✦</span>
                <span>Fast express checkout with saved delivery addresses</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✦</span>
                <span>Direct customer care and order tracking</span>
              </div>
            </div>

            {/* Bottom Reassurance */}
            <div className="relative z-10 text-[11px] text-stone-400 border-t border-stone-800 pt-6">
              100% genuine products • Free delivery over ₹999
            </div>
          </div>

          {/* RIGHT COLUMN: Sign Up Form (lg:col-span-7) */}
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
                Create an Account
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-500">
                Enter your details to create your personal shopping profile.
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-xs sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
                />
              </div>

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
                    placeholder="Create a secure password"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 pr-11 text-xs sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1.5 cursor-pointer z-10"
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
                  className="w-full inline-flex items-center justify-center rounded-full bg-stone-900 py-3.5 px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-98 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
                >
                  <span className="relative z-1">{loading ? "Creating account..." : "Create Account →"}</span>
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
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 px-4 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition cursor-pointer min-h-[42px]"
              >
                <span className="relative z-1">Google</span>
              </button>
              <button
                type="button"
                onClick={() => setSocialProvider("apple")}
                className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 px-4 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition cursor-pointer min-h-[42px]"
              >
                <span className="relative z-1">Apple ID</span>
              </button>
            </div>

            {/* Bottom link to Login */}
            <div className="mt-8 border-t border-stone-100 pt-5 text-center text-xs text-stone-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-stone-900 hover:underline"
              >
                Sign in
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
          navigate("/");
        }}
      />
    </main>
  );
}
