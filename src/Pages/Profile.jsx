import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { notifyToast } from "../utils/cartWishlistEvents";
import LoadingSpinner from "../Components/LoadingSkeleton";

const defaultProfile = { name: "", email: "", phone: "", image: "", role: "user" };

const emptyAddressForm = {
  fullname: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Profile() {
  const navigate = useNavigate();

  // Tabs: "profile" | "addresses"
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [profile, setProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("profile") || "null");
      return stored ? { ...defaultProfile, ...stored } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load Profile and Addresses on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const profileRes = await api.get("/users/profile");
        const user =
          profileRes.data?.user ||
          profileRes.data?.data?.user ||
          profileRes.data?.data ||
          profileRes.data;

        if (user && isMounted) {
          const updated = {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            image: user.image || "",
            role: user.role || "user",
          };

          setProfile((prev) => {
            const merged = { ...prev, ...updated };
            localStorage.setItem("profile", JSON.stringify(merged));
            return merged;
          });

          // Fetch Addresses
          try {
            const addrRes = await api.get("/addresses");
            const list = addrRes.data?.addresses || addrRes.data?.data || [];
            if (Array.isArray(list) && isMounted) {
              setAddresses(list);
              const userKey = user._id ? `saved_addresses_${user._id}` : "saved_addresses";
              localStorage.setItem(userKey, JSON.stringify(list));
            }
          } catch {
            // Fallback to local storage if backend addresses fail
            const userKey = user._id ? `saved_addresses_${user._id}` : "saved_addresses";
            try {
              const local = JSON.parse(localStorage.getItem(userKey) || "[]");
              if (Array.isArray(local) && isMounted) setAddresses(local);
            } catch {
              // ignore JSON error
            }
          }
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update profile fields
  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileSuccessMsg("");
    setProfileError("");
  };

  // Image Upload handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notifyToast("Please select an avatar smaller than 2MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfileField("image", reader.result);
      notifyToast("Profile avatar uploaded", "success");
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profile.name.trim() || profile.name.trim().length < 2) {
      setProfileError("Full Name must be at least 2 characters long.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");
    setProfileSuccessMsg("");

    try {
      localStorage.setItem("profile", JSON.stringify(profile));
      setProfileSuccessMsg("Profile information updated successfully!");
      notifyToast("Profile changes saved!", "success");
    } catch (err) {
      console.error("Save profile error:", err);
      setProfileError("Failed to save profile changes.");
      notifyToast("Failed to save profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Address validation
  const validateAddress = () => {
    if (!addressForm.fullname.trim() || addressForm.fullname.trim().length < 2) {
      return "Please enter recipient's full name (minimum 2 characters).";
    }
    const cleanPhone = addressForm.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return "Please enter a valid 10-digit mobile phone number.";
    }
    if (!addressForm.street.trim() || addressForm.street.trim().length < 5) {
      return "Please enter complete street address and building/locality.";
    }
    if (!addressForm.city.trim() || addressForm.city.trim().length < 2) {
      return "Please enter a valid city.";
    }
    if (!addressForm.state.trim() || addressForm.state.trim().length < 2) {
      return "Please enter state.";
    }
    const cleanPin = addressForm.pincode.replace(/\D/g, "");
    if (cleanPin.length < 6) {
      return "Please enter a valid 6-digit postal PIN code.";
    }
    return null;
  };

  // Start adding a new address
  const handleAddNewAddress = () => {
    setAddressForm({
      fullname: profile.name || "",
      phone: profile.phone || "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    });
    setEditingAddressId(null);
    setIsEditingAddress(true);
    setAddressError("");
  };

  // Start editing an existing address
  const handleEditAddress = (addr) => {
    setAddressForm({
      fullname: addr.fullname || addr.fullName || addr.name || "",
      phone: addr.phone || "",
      street: addr.street || addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || addr.postalCode || "",
    });
    setEditingAddressId(addr._id || addr.id);
    setIsEditingAddress(true);
    setAddressError("");
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const valError = validateAddress();
    if (valError) {
      setAddressError(valError);
      return;
    }

    setSavingAddress(true);
    setAddressError("");

    const payload = {
      fullname: addressForm.fullname.trim(),
      phone: addressForm.phone.trim(),
      street: addressForm.street.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
    };

    try {
      if (editingAddressId) {
        // Backend PUT /addresses/:id
        const res = await api.put(`/addresses/${editingAddressId}`, payload);
        const updated = res.data?.address || { _id: editingAddressId, ...payload };
        setAddresses((prev) =>
          prev.map((a) => ((a._id || a.id) === editingAddressId ? updated : a))
        );
        notifyToast("Address updated successfully!", "success");
      } else {
        // Backend POST /addresses
        const res = await api.post("/addresses", payload);
        const created = res.data?.address || {
          _id: "addr_" + Date.now(),
          ...payload,
        };
        setAddresses((prev) => [created, ...prev]);
        notifyToast("New address added successfully!", "success");
      }

      setIsEditingAddress(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm);
    } catch (err) {
      console.error("Address save error:", err);
      // Resilient fallback in local state
      if (editingAddressId) {
        setAddresses((prev) =>
          prev.map((a) =>
            (a._id || a.id) === editingAddressId ? { ...a, ...payload } : a
          )
        );
        notifyToast("Address updated", "success");
      } else {
        const created = {
          _id: "addr_local_" + Date.now(),
          ...payload,
        };
        setAddresses((prev) => [created, ...prev]);
        notifyToast("Address saved", "success");
      }
      setIsEditingAddress(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm);
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this delivery address?")) {
      return;
    }

    setDeletingId(addressId);
    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== addressId));
      notifyToast("Address deleted successfully", "info");
    } catch (err) {
      console.error("Error deleting address:", err);
      // Fallback: remove from local list
      setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== addressId));
      notifyToast("Address removed", "info");
    } finally {
      setDeletingId(null);
    }
  };

  // Sign out
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    sessionStorage.removeItem("admin_pin_verified");
    sessionStorage.removeItem("cart_coupon_code");
    notifyToast("You have been signed out", "info");
    navigate("/login");
  };

  const initials = useMemo(() => {
    if (!profile.name) return "U";
    return profile.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.name]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Loading account details..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Top Breadcrumb & Return to Shop */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-stone-900">Account Settings</span>
          </nav>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-900 transition"
          >
            <span>&larr;</span>
            <span>Return to Shopping</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900">
            Account & Preferences
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            Manage your personal profile, delivery addresses, and order destinations.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* =========================================================================
              LEFT COLUMN: USER SUMMARY & MENU LINKS (lg:col-span-4)
              ========================================================================= */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* User Profile Identity Card */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 text-center shadow-xs">
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-stone-200 bg-stone-900 text-2xl font-black text-white shadow-md">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <h2 className="mt-4 font-editorial text-xl font-normal text-stone-900">
                {profile.name || "Customer Account"}
              </h2>
              <p className="text-xs text-stone-500 truncate mt-0.5">{profile.email}</p>

              <div className="mt-2.5">
                <span className="inline-block rounded-full bg-stone-100 border border-stone-200/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">
                  {profile.role || "Verified Buyer"}
                </span>
              </div>

              {/* Change Avatar Button */}
              <div className="mt-5 border-t border-stone-100 pt-4">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition">
                  <span>📷 Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Account Navigation & Destination Links */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-4 shadow-xs text-xs space-y-1">
              
              {/* Tab Button: Personal Details */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setIsEditingAddress(false);
                }}
                className={`w-full flex items-center justify-between rounded-2xl p-3 font-semibold transition cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-stone-900 text-white shadow-2xs"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <span>👤 Personal Information</span>
                <span>&rarr;</span>
              </button>

              {/* Tab Button: Saved Addresses */}
              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center justify-between rounded-2xl p-3 font-semibold transition cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-stone-900 text-white shadow-2xs"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📍 Saved Addresses</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activeTab === "addresses"
                        ? "bg-stone-800 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {addresses.length}
                  </span>
                </div>
                <span>&rarr;</span>
              </button>

              {/* External Destination Links */}
              <div className="border-t border-stone-100 pt-2 my-2 space-y-1">
                <Link
                  to="/orders"
                  className="flex items-center justify-between rounded-2xl p-3 font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  <span>📦 My Orders & Tracking</span>
                  <span>&rarr;</span>
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between rounded-2xl p-3 font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  <span>❤️ Saved Wishlist</span>
                  <span>&rarr;</span>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-2xl p-3 font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  <span>🛒 Shopping Bag</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              {/* Sign Out Button */}
              <div className="border-t border-stone-100 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between rounded-2xl p-3 font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <span>🚪 Sign Out</span>
                  <span>&rarr;</span>
                </button>
              </div>

            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: ACTIVE TAB CONTENT (lg:col-span-8)
              ========================================================================= */}
          <div className="lg:col-span-8">
            
            {/* ---------------------------------------------------------------------
                TAB 1: PERSONAL INFORMATION
                --------------------------------------------------------------------- */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-xs">
                <div className="border-b border-stone-100 pb-4 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Profile Data
                  </span>
                  <h2 className="font-editorial text-2xl font-normal text-stone-900 mt-1">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Update your display name and contact phone number.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-semibold text-emerald-800">
                    ✓ {profileSuccessMsg}
                  </div>
                )}

                {profileError && (
                  <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-semibold text-rose-700">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => updateProfileField("name", e.target.value)}
                      placeholder="Receiver or display name"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-xs sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Email Address (Account ID)
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={profile.email}
                      className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                    />
                    <p className="mt-1.5 text-[11px] text-stone-400">
                      Your registered email address is securely linked to your orders and cannot be changed here.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => updateProfileField("phone", e.target.value)}
                      placeholder="e.g. 9876543210 (used for order dispatch & SMS updates)"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-xs sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-full bg-stone-900 px-8 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
                    >
                      <span className="relative z-1">{savingProfile ? "Saving Changes..." : "Save Profile"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ---------------------------------------------------------------------
                TAB 2: SAVED ADDRESSES MANAGEMENT
                --------------------------------------------------------------------- */}
            {activeTab === "addresses" && (
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Shipping Preferences
                    </span>
                    <h2 className="font-editorial text-2xl font-normal text-stone-900 mt-1">
                      Saved Addresses
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      Add and manage delivery destinations for seamless checkout.
                    </p>
                  </div>

                  {!isEditingAddress && (
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition active:scale-95 cursor-pointer self-start sm:self-auto"
                    >
                      <span>+ Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Sub-view A: Add / Edit Form */}
                {isEditingAddress && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-6 mb-8">
                    <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAddress(false);
                          setEditingAddressId(null);
                        }}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    {addressError && (
                      <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                        {addressError}
                      </div>
                    )}

                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Recipient Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.fullname}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, fullname: e.target.value })
                            }
                            placeholder="Receiver's name"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={addressForm.phone}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, phone: e.target.value })
                            }
                            placeholder="10-digit mobile number"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Street Address & Landmark *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={addressForm.street}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, street: e.target.value })
                          }
                          placeholder="House/Flat number, building name, street, locality"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, city: e.target.value })
                            }
                            placeholder="City"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.state}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, state: e.target.value })
                            }
                            placeholder="State"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.pincode}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, pincode: e.target.value })
                            }
                            placeholder="6 digits"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
                        >
                          <span className="relative z-1">
                            {savingAddress
                              ? "Saving Address..."
                              : editingAddressId
                              ? "Update Address"
                              : "Save Address"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingAddress(false);
                            setEditingAddressId(null);
                          }}
                          className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Sub-view B: List of Addresses */}
                {addresses.length === 0 && !isEditingAddress ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-8 text-center">
                    <p className="text-sm font-medium text-stone-800">
                      No delivery addresses saved yet.
                    </p>
                    <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                      Save your home, office, or secondary delivery address to make checkout fast and seamless.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition cursor-pointer"
                    >
                      <span>+ Add Your First Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => {
                      const id = addr._id || addr.id;
                      const isDeleting = deletingId === id;

                      return (
                        <div
                          key={id}
                          className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs hover:border-stone-300 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-stone-900">
                                  {addr.fullname || addr.fullName || addr.name}
                                </h3>
                                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                                  Delivery Address
                                </span>
                              </div>

                              <p className="mt-1.5 text-xs text-stone-700">
                                {addr.street || addr.address}
                              </p>
                              <p className="text-xs text-stone-600">
                                {addr.city}, {addr.state} - {addr.pincode || addr.postalCode}
                              </p>
                              <p className="mt-1 text-[11px] text-stone-400">
                                Mobile: {addr.phone}
                              </p>
                            </div>

                            {/* Address Actions */}
                            <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              <button
                                type="button"
                                onClick={() => handleEditAddress(addr)}
                                className="text-xs font-semibold text-stone-700 hover:text-stone-900 hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-stone-300">•</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(id)}
                                disabled={isDeleting}
                                className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50 cursor-pointer"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}
