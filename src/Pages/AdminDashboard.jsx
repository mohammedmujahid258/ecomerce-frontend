import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentPin, setCurrentPin] = useState(
    () => localStorage.getItem("admin_master_pin") || "1234"
  );
  const [newPin, setNewPin] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);

  const handleLockSession = () => {
    sessionStorage.removeItem("admin_pin_verified");
    navigate("/admin");
    window.location.reload();
  };

  const handleUpdatePin = (event) => {
    event.preventDefault();
    if (newPin.trim().length < 4) {
      setPinChangeMsg("PIN must be at least 4 digits.");
      return;
    }
    localStorage.setItem("admin_master_pin", newPin.trim());
    setCurrentPin(newPin.trim());
    setNewPin("");
    setPinChangeMsg("✅ Admin PIN updated successfully!");
    setTimeout(() => {
      setPinChangeMsg("");
      setShowPinChange(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#fff7d6] p-6 sm:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-300 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e7b900] text-sm">
                🛡️
              </span>
              <h1 className="text-3xl font-black text-[#202016]">
                Admin Dashboard
              </h1>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#514810]">
              Full administrative controls & security management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLockSession}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-rose-600 cursor-pointer"
              title="Lock admin session immediately"
            >
              🔒 Lock Session
            </button>
            <Link
              to="/"
              className="rounded-lg bg-[#202016] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#e7b900] hover:text-[#202016]"
            >
              ← Back to Store
            </Link>
          </div>
        </div>

        {/* Management Cards Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            to="/admin/products"
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#202016] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0a8] text-2xl">
              📦
            </div>
            <h2 className="mt-4 text-xl font-black text-[#202016] group-hover:text-[#a48500]">
              Products
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Add new catalog products, update prices, inventory, and remove items.
            </p>
            <span className="mt-4 inline-block text-xs font-bold text-[#202016]">
              Manage Products →
            </span>
          </Link>

          <Link
            to="/admin/orders"
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#202016] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0a8] text-2xl">
              🛍️
            </div>
            <h2 className="mt-4 text-xl font-black text-[#202016] group-hover:text-[#a48500]">
              Orders
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Track customer orders, check shipping details, and update statuses.
            </p>
            <span className="mt-4 inline-block text-xs font-bold text-[#202016]">
              Manage Orders →
            </span>
          </Link>

          <Link
            to="/admin/all/users"
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#202016] hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0a8] text-2xl">
              👥
            </div>
            <h2 className="mt-4 text-xl font-black text-[#202016] group-hover:text-[#a48500]">
              Users
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              View registered users, customer emails, and role permissions.
            </p>
            <span className="mt-4 inline-block text-xs font-bold text-[#202016]">
              Manage Users →
            </span>
          </Link>
        </div>

        {/* Admin Security PIN Settings Card */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <h3 className="text-base font-bold text-[#202016]">
                  Master Security PIN Protection
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Your 4-digit PIN is active. Current PIN:{" "}
                <span className="font-mono font-bold text-[#202016]">
                  {"•".repeat(currentPin.length)}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPinChange(!showPinChange)}
              className="self-start rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#202016] transition hover:bg-[#e7b900] cursor-pointer"
            >
              {showPinChange ? "Close PIN Settings" : "Change Security PIN ✏️"}
            </button>
          </div>

          {showPinChange && (
            <form onSubmit={handleUpdatePin} className="mt-5 border-t border-slate-100 pt-5">
              <label
                htmlFor="new-admin-pin"
                className="block text-xs font-bold text-[#202016]"
              >
                Set New Master PIN (4 to 8 digits)
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  id="new-admin-pin"
                  type="text"
                  maxLength="8"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 5678"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-[#202016] outline-none focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]"
                  required
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#e7b900] px-4 py-2 text-xs font-black text-[#202016] transition hover:bg-[#202016] hover:text-white cursor-pointer"
                >
                  Save New PIN
                </button>
              </div>

              {pinChangeMsg && (
                <p className="mt-2 text-xs font-bold text-emerald-700">
                  {pinChangeMsg}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;