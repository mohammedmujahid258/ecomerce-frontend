import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentPin, setCurrentPin] = useState(
    () => localStorage.getItem("admin_master_pin") || "1234"
  );
  const [newPin, setNewPin] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);

  const handleLockSession = () => {
    sessionStorage.removeItem("admin_pin_verified");
    notifyToast("Admin session locked", "info");
    navigate("/admin");
    window.location.reload();
  };

  const handleUpdatePin = (event) => {
    event.preventDefault();
    if (newPin.trim().length < 4) {
      notifyToast("PIN must be at least 4 digits", "warning");
      return;
    }
    localStorage.setItem("admin_master_pin", newPin.trim());
    setCurrentPin(newPin.trim());
    setNewPin("");
    setShowPinChange(false);
    notifyToast("Admin Security PIN updated successfully!", "success");
  };

  return (
    <main className="min-h-screen bg-slate-50/70 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Executive Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-bold">
                🛡️
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Store Administration
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Executive controls for catalog inventory, orders fulfillment, and user accounts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLockSession}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-rose-600 transition cursor-pointer"
            >
              🔒 Lock Session
            </button>
            <Link
              to="/"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800"
            >
              &larr; View Storefront
            </Link>
          </div>
        </div>

        {/* Management Modules Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {/* Products Module */}
          <Link
            to="/admin/products"
            className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-slate-400 hover:shadow-md hover:-translate-y-1"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-2xl group-hover:scale-110 transition">
                📦
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-blue-600">
                Products & Inventory
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Add new products with photo uploads, modify prices, track stock availability, and delete discontinued items.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-blue-600">
              Manage Products &rarr;
            </span>
          </Link>

          {/* Orders Module */}
          <Link
            to="/admin/orders"
            className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-slate-400 hover:shadow-md hover:-translate-y-1"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-2xl group-hover:scale-110 transition">
                🛍️
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-emerald-600">
                Customer Orders
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Review all incoming customer purchases, inspect destination shipping addresses, and update fulfillment status.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-emerald-600">
              Manage Orders &rarr;
            </span>
          </Link>

          {/* Users Module */}
          <Link
            to="/admin/all/users"
            className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-slate-400 hover:shadow-md hover:-translate-y-1"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 text-2xl group-hover:scale-110 transition">
                👥
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-purple-600">
                User Directory
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Inspect registered customer profiles, emails, account IDs, and administrative access privileges.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-purple-600">
              Manage Users &rarr;
            </span>
          </Link>
        </div>

        {/* Security PIN Settings Box */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🔐</span> Master Security PIN
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Secondary authentication code protecting your admin session. Current PIN:{" "}
                <span className="font-mono font-bold text-slate-900">
                  {"•".repeat(currentPin.length)}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPinChange(!showPinChange)}
              className="self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {showPinChange ? "Close PIN Form" : "Change Security PIN"}
            </button>
          </div>

          {showPinChange && (
            <form onSubmit={handleUpdatePin} className="mt-5 border-t border-slate-100 pt-5 max-w-sm">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Master PIN (4 to 8 digits)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 5678"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-slate-400"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 cursor-pointer"
                >
                  Save PIN
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}