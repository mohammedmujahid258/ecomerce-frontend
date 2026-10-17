import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { notifyToast } from "../utils/cartWishlistEvents";

const defaultProfile = { name: "", email: "", phone: "", image: "", role: "user" };

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("profile") || "null");
      return stored ? { ...defaultProfile, ...stored } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api
      .get("/users/profile")
      .then((res) => {
        const user = res.data?.user || res.data?.data?.user || res.data?.data || res.data;
        if (user) {
          setProfile((prev) => {
            const updated = {
              ...prev,
              name: user.name || prev.name,
              email: user.email || prev.email,
              phone: user.phone || prev.phone,
              role: user.role || prev.role || "user",
            };
            localStorage.setItem("profile", JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch((err) => {
        console.error("Profile sync error:", err);
      });
  }, []);

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSavedSuccess(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notifyToast("Please select an image smaller than 2MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("image", reader.result);
      notifyToast("Profile avatar uploaded", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem("profile", JSON.stringify(profile));
      setSavedSuccess(true);
      notifyToast("Profile information saved successfully!", "success");
    } catch (err) {
      console.error("Save profile error:", err);
      notifyToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    sessionStorage.removeItem("admin_pin_verified");
    notifyToast("You have been signed out", "info");
    navigate("/login");
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Account Settings
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage your personal information, address preferences, and account security.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            &larr; Back to Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Left Summary Card (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-xs">
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-900 text-2xl font-black text-white shadow-md">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-900">
                {profile.name || "Customer Account"}
              </h2>
              <p className="text-xs text-slate-500 truncate">{profile.email}</p>

              <span className="mt-2 inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
                {profile.role || "Verified Buyer"}
              </span>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
                  <span>📷 Change Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs text-xs space-y-1">
              <Link
                to="/orders"
                className="flex items-center justify-between rounded-xl p-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>📦 My Orders</span>
                <span>&rarr;</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center justify-between rounded-xl p-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>❤️ Saved Wishlist</span>
                <span>&rarr;</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center justify-between rounded-xl p-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>🛒 Shopping Bag</span>
                <span>&rarr;</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between rounded-xl p-3 font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <span>🚪 Sign Out</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Form Card (8 cols) */}
          <div className="md:col-span-8">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                Personal Information
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Account ID)
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={profile.email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Your registered email address is linked to your order history.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter your phone number for delivery updates"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>

                  {savedSuccess && (
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ Profile updated successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
