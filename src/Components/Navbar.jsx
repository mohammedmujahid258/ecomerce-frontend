import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { storeEvents, CART_UPDATED, WISHLIST_UPDATED, notifyToast } from "../utils/cartWishlistEvents";

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  } catch {
    return {};
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const accountMenuRef = useRef(null);

  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
  const isAdmin = userRole === "admin";
  const profile = getStoredProfile();

  const profileInitials = profile.name
    ? profile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  useEffect(() => {
    let isMounted = true;

    const updateCounts = async () => {
      const activeToken = localStorage.getItem("token");
      if (!activeToken) {
        if (isMounted) {
          setCartCount(0);
          setWishlistCount(0);
        }
        return;
      }
      try {
        const [cartRes, wishRes] = await Promise.allSettled([
          api.get("/cart"),
          api.get("/wishlist"),
        ]);

        if (!isMounted) return;

        if (cartRes.status === "fulfilled") {
          const items = cartRes.value.data?.cart?.items || [];
          const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
          setCartCount(count);
        }
        if (wishRes.status === "fulfilled") {
          const products = wishRes.value.data?.wishlist?.products || [];
          setWishlistCount(products.length);
        }
      } catch (err) {
        console.error("Error refreshing counts:", err);
      }
    };

    updateCounts();

    const unsubCart = storeEvents.on(CART_UPDATED, updateCounts);
    const unsubWish = storeEvents.on(WISHLIST_UPDATED, updateCounts);

    return () => {
      isMounted = false;
      unsubCart();
      unsubWish();
    };
  }, [token]);

  // Close menus on outside click or route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = navSearch.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    sessionStorage.removeItem("admin_pin_verified");
    setCartCount(0);
    setWishlistCount(0);
    notifyToast("You have been signed out", "info");
    navigate("/login");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Electronics", path: "/products?category=electronics" },
    { label: "Fashion", path: "/products?category=fabric" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="brand-mark">M</span>
            <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
              My<span className="text-blue-600">Store</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map(({ label, path }) => {
              const isActive =
                path === "/"
                  ? location.pathname === "/" && !location.search
                  : location.pathname + location.search === path;

              return (
                <Link
                  key={path}
                  to={path}
                  className={`text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products, brands, categories..."
              aria-label="Search products"
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              🔍
            </span>
            {navSearch && (
              <button
                type="button"
                onClick={() => setNavSearch("")}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear input"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-slate-800 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right Actions: Wishlist, Cart, Account */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Wishlist Icon Button */}
          <Link
            to="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Shopping Cart"
            title="Shopping Cart"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div className="relative" ref={accountMenuRef}>
            {token ? (
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1 text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                aria-label="User account menu"
                aria-expanded={accountMenuOpen}
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-900 text-xs font-bold text-white shadow-xs">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    profileInitials
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-slate-800">
                  {profile.name ? profile.name.split(" ")[0] : "Account"}
                </span>
                <span className="hidden lg:inline text-[10px] text-slate-400">▼</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Account Menu Popup */}
            {accountMenuOpen && token && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
                <div className="border-b border-slate-100 px-3 py-2.5 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {profile.name || "Signed in"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {profile.email || "customer@mystore.com"}
                  </p>
                  {isAdmin && (
                    <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      Administrator
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>📦</span>
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>❤️</span>
                    <span>Saved Items</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                    >
                      <span>🛡️</span>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>

                <div className="mt-2 border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden shadow-lg animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-16 text-xs text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                🔍
              </span>
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white"
              >
                Go
              </button>
            </div>
          </form>

          {/* Mobile Links */}
          <div className="space-y-1">
            <Link
              to="/"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              All Products
            </Link>
            <Link
              to="/products?category=electronics"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              Electronics
            </Link>
            <Link
              to="/products?category=fabric"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              Fashion & Fabric
            </Link>
            <Link
              to="/products?category=shoes"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              Shoes & Footwear
            </Link>
            <Link
              to="/products?category=mobile"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              Mobiles & Devices
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>Saved Items (Wishlist)</span>
              {wishlistCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>Shopping Cart</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/orders"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              My Orders
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900"
              >
                🛡️ Admin Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Auth Bar */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800"
                >
                  Join MyStore
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
