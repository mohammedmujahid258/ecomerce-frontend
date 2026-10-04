import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
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
      width="20"
      height="20"
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

function AdminRoute({ children }) {
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
      // This effect synchronizes the guard state with the current auth token.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          // If server reports user is not admin, check cached role as fallback
          const cachedRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
          if (cachedRole === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            localStorage.setItem("user_role", role || "user");
          }
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

  // Handle PIN Submission
  const handleVerifyPin = (event) => {
    event.preventDefault();
    setPinError("");

    const masterPin = localStorage.getItem("admin_master_pin") || "1234";

    if (enteredPin.trim() === masterPin) {
      sessionStorage.setItem("admin_pin_verified", "true");
      setIsPinVerified(true);
    } else {
      setPinError("⚠️ Incorrect Security PIN. Access denied.");
      setEnteredPin("");
    }
  };

  // 1. If not logged in -> redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. While checking admin credentials
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff7d6] p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#202016] border-t-transparent" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#202016]">
          🔒 Verifying Administrator Credentials...
        </p>
      </div>
    );
  }

  // 3. If logged in but NOT an admin -> Access Denied block screen
  if (!isAdmin) {
    const handleSwitchAccount = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user_role");
      sessionStorage.removeItem("admin_pin_verified");
      navigate("/login");
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7d6] p-6 text-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgb(32_32_22/15%)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-3xl text-rose-600">
            🔒
          </div>
          <h1 className="mt-4 text-2xl font-black text-[#202016]">Access Denied</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-rose-600">
            Administrator Privileges Required
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            You are logged in as <span className="font-bold text-slate-800">{userEmail}</span>.
            Standard customer accounts cannot access, edit, or manage store products or orders.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/"
              className="w-full rounded-md bg-[#e7b900] py-2.5 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white"
            >
              Return to Store
            </Link>
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full rounded-md border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
            >
              Log in with an Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Admin, but PIN NOT yet entered -> Show 4-Digit Security PIN Screen
  if (!isPinVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7d6] p-4 sm:p-6">
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_24px_70px_rgb(32_32_22/18%)] border border-slate-100">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0a8] text-3xl shadow-sm">
              🛡️
            </div>
            <h1 className="mt-4 text-2xl font-black text-[#202016]">
              Admin Security Verification
            </h1>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Enter your secret 4-digit Master PIN to unlock the store control panel.
            </p>
          </div>

          {pinError && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-center text-xs font-bold text-rose-600">
              {pinError}
            </div>
          )}

          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-pin-input"
                className="mb-1.5 block text-center text-[11px] font-bold uppercase tracking-wider text-[#202016]"
              >
                Enter 4-Digit PIN
              </label>

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
                  className={`w-full rounded-xl border text-center text-2xl font-black tracking-widest py-3 px-10 outline-none transition-all ${
                    pinError
                      ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-300 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-300 bg-slate-50 text-[#202016] focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-[#202016] focus:outline-none"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                Default Master PIN: <span className="font-bold text-[#202016]">1234</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#e7b900] py-3 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white cursor-pointer"
            >
              Unlock Admin Panel 🔓
            </button>

            <Link
              to="/"
              className="block text-center text-xs font-bold text-slate-500 hover:text-[#202016] transition pt-2"
            >
              ← Cancel & Return to Store
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // 5. Admin role verified AND PIN verified -> Grant full access to Admin pages
  return children;
}

export default AdminRoute;
