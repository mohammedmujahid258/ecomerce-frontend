import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";

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
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(
    () => sessionStorage.getItem("admin_pin_verified") === "true"
  );
  const [enteredPin, setEnteredPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await api.get("/users/profile");
        const user =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.data ||
          response.data;

        const role = (user?.role || "").toLowerCase().trim();
        setUserEmail(user?.email || "Current User");

        if (role === "admin") {
          setIsAdmin(true);
          localStorage.setItem("user_role", "admin");
        } else {
          const cachedRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
          setIsAdmin(cachedRole === "admin");
        }
      } catch (error) {
        console.error("Admin verification check failed:", error);
        const cachedRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
        setIsAdmin(cachedRole === "admin");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [token]);

  const handleVerifyPin = (event) => {
    event.preventDefault();
    setPinError("");

    const masterPin = localStorage.getItem("admin_master_pin") || "1234";

    if (enteredPin.trim() === masterPin) {
      sessionStorage.setItem("admin_pin_verified", "true");
      setIsPinVerified(true);
    } else {
      setPinError("Incorrect Security PIN. Access denied.");
      setEnteredPin("");
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-800">
          Verifying Administrator Permissions...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-600">
            🔒
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-rose-600">
            Administrator Authorization Required
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            Logged in as <span className="font-bold text-slate-800">{userEmail}</span>. Standard customer accounts do not have permission to manage store products, orders, or users.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/"
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              Return to Store
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user_role");
                sessionStorage.removeItem("admin_pin_verified");
                navigate("/login");
              }}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Sign in with an Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isPinVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-xs">
              🛡️
            </div>
            <h1 className="mt-4 text-2xl font-black text-slate-900">
              Admin Security Verification
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Enter your 4-digit Master PIN to unlock administrative controls.
            </p>
          </div>

          {pinError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-600">
              {pinError}
            </div>
          )}

          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <div>
              <div className="relative mx-auto max-w-xs">
                <input
                  id="admin-pin-input"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="8"
                  value={enteredPin}
                  onChange={(event) => {
                    setEnteredPin(event.target.value);
                    if (pinError) setPinError("");
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 text-center text-2xl font-black tracking-widest py-3 px-10 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                Default Master PIN: <span className="font-bold text-slate-900">1234</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 cursor-pointer"
            >
              Unlock Control Panel
            </button>

            <Link
              to="/"
              className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-900 pt-2"
            >
              &larr; Cancel & Return to Store
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
