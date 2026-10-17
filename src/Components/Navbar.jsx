import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { storeEvents, CART_UPDATED, WISHLIST_UPDATED, notifyToast } from "../utils/cartWishlistEvents";
import AnnouncementBar from "./AnnouncementBar";

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  } catch {
    return {};
  }
}

// 5 actual categories supported by the MongoDB database
const storeCategories = [
  {
    name: "Smartphones & Mobile",
    query: "mobile",
    desc: "Flagship phones and mobile tech",
    icon: "📱",
  },
  {
    name: "Electronics & Audio",
    query: "electronics",
    desc: "High-fidelity audio & headphones",
    icon: "🎧",
  },
  {
    name: "Apparel & Fabric",
    query: "fabric",
    desc: "Everyday wear & minimal shirts",
    icon: "👕",
  },
  {
    name: "Footwear & Shoes",
    query: "shoes",
    desc: "Comfortable everyday sneakers",
    icon: "👟",
  },
  {
    name: "Eyewear & Accessories",
    query: "glass",
    desc: "Modern sunglasses & clean accents",
    icon: "🕶️",
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation and menu states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Search input & catalog cache for real-time search
  const [navSearch, setNavSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  // Live Cart & Wishlist counts
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Refs for outside click handling
  const accountMenuRef = useRef(null);
  const categoriesMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Fetch product catalog once for real-time search suggestions
  useEffect(() => {
    let isMounted = true;
    api
      .get("/products")
      .then(({ data }) => {
        if (!isMounted) return;
        setAllProducts(data.products || []);
      })
      .catch((err) => {
        console.error("Failed to load products for live search:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync live Cart & Wishlist counts from backend
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
        console.error("Error refreshing navbar counts:", err);
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

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setCategoriesOpen(false);
    setSearchFocused(false);
  }, [location.pathname, location.search]);

  // Handle outside click to dismiss dropdowns and search popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle global Escape key to close open menus
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setAccountMenuOpen(false);
        setCategoriesOpen(false);
        setSearchFocused(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute live search matches
  const liveSearchResults = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    return allProducts
      .filter((p) => {
        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        const descMatch = (p.description || "").toLowerCase().includes(q);
        return nameMatch || catMatch || descMatch;
      })
      .slice(0, 4);
  }, [navSearch, allProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = navSearch.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
    setSearchFocused(false);
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

  // Active state indicators
  const isHomeActive = location.pathname === "/" && !location.search;
  const isShopActive = location.pathname === "/products" && !location.search;
  const isCategoryActive = location.search.includes("category=");

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md">
      {/* Section 1: Announcement Bar */}
      <AnnouncementBar />

      {/* Section 2: Navbar - 3 Balanced Areas */}
      <div className="w-full border-b border-stone-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          
          {/* =========================================================================
              AREA 1 (LEFT): STORE LOGO / BRAND NAME (No yellow, clean monochrome)
              ========================================================================= */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-stone-900 rounded-lg"
              aria-label="MyStore Home"
            >
              {/* Simple monochrome store icon */}
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold tracking-tight text-white shadow-xs transition group-hover:bg-stone-800">
                M
              </span>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition">
                  MyStore
                </span>
                <span className="hidden sm:block text-[9px] font-semibold tracking-widest uppercase text-stone-400 -mt-1">
                  Curated Living
                </span>
              </div>
            </Link>
          </div>

          {/* =========================================================================
              AREA 2 (CENTER): NAVIGATION (Home, Shop, Categories)
              ========================================================================= */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {/* Home Link */}
            <Link
              to="/"
              className={`text-xs font-semibold tracking-wide transition pb-0.5 focus-visible:outline-2 focus-visible:outline-stone-900 rounded-xs ${
                isHomeActive
                  ? "text-stone-900 font-bold border-b-2 border-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Home
            </Link>

            {/* Shop Link */}
            <Link
              to="/products"
              className={`text-xs font-semibold tracking-wide transition pb-0.5 focus-visible:outline-2 focus-visible:outline-stone-900 rounded-xs ${
                isShopActive
                  ? "text-stone-900 font-bold border-b-2 border-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Shop
            </Link>

            {/* Categories Dropdown Popover */}
            <div className="relative" ref={categoriesMenuRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex items-center gap-1.5 text-xs font-semibold tracking-wide transition pb-0.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-stone-900 rounded-xs ${
                  categoriesOpen || isCategoryActive
                    ? "text-stone-900 font-bold border-b-2 border-stone-900"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                aria-label="Shop by categories"
              >
                <span>Categories</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180 text-stone-900" : "text-stone-400"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Categories Menu Popover */}
              {categoriesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 origin-top rounded-2xl border border-stone-200/90 bg-white p-2.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Curated Departments
                    </p>
                  </div>

                  <div className="space-y-1">
                    {storeCategories.map((cat) => (
                      <Link
                        key={cat.query}
                        to={`/products?category=${encodeURIComponent(cat.query)}`}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-stone-50 group focus-visible:outline-2 focus-visible:outline-stone-900"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-sm group-hover:bg-stone-200 transition">
                          {cat.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-800 group-hover:text-stone-900 truncate">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">
                            {cat.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-2 border-t border-stone-100 pt-2">
                    <Link
                      to="/products"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition focus-visible:outline-2 focus-visible:outline-stone-900"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <span>Browse All Products</span>
                      <span className="text-stone-400">&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* =========================================================================
              AREA 3 (RIGHT): SEARCH, ACCOUNT, WISHLIST, CART
              ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Expandable Real Search Field */}
            <div className="relative hidden md:block" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search products..."
                  aria-label="Search store products"
                  className={`rounded-full border border-stone-200 bg-stone-50/80 py-1.5 pl-8 pr-16 text-xs text-stone-800 placeholder-stone-400 outline-none transition-all duration-300 focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100 ${
                    searchFocused ? "w-60 lg:w-72 shadow-sm" : "w-36 lg:w-48"
                  }`}
                />
                
                {/* Search Icon */}
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>

                {/* Clear Button */}
                {navSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearch("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                    title="Clear search input"
                    aria-label="Clear search input"
                  >
                    ✕
                  </button>
                )}

                {/* Search Button with 100% visible text */}
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-stone-800 active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Real-Time Live Search Results Dropdown */}
              {searchFocused && navSearch.trim().length >= 2 && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 origin-top-right rounded-2xl border border-stone-200/90 bg-white p-2.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <div className="px-3 py-1.5 border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Product Matches
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Press Enter to search
                    </span>
                  </div>

                  {liveSearchResults.length > 0 ? (
                    <div className="space-y-1">
                      {liveSearchResults.map((prod) => (
                        <Link
                          key={prod._id}
                          to={`/products/${prod._id}`}
                          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-stone-50 group"
                          onClick={() => setSearchFocused(false)}
                        >
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-stone-100 p-1 flex items-center justify-center">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-stone-900 group-hover:text-stone-600 truncate">
                              {prod.name}
                            </p>
                            <p className="text-[11px] font-bold text-stone-700">
                              ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <span className="text-[10px] font-medium text-stone-400">
                            {(prod.stock ?? 0) > 0 ? "In stock" : "Sold out"}
                          </span>
                        </Link>
                      ))}

                      <div className="mt-2 border-t border-stone-100 pt-2">
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="w-full text-center text-xs font-semibold text-stone-800 hover:text-stone-950 py-1 cursor-pointer"
                        >
                          View all results for &ldquo;{navSearch}&rdquo; &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Clear Empty State for Search */
                    <div className="p-4 text-center">
                      <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-2">
                        🔍
                      </div>
                      <p className="text-xs font-semibold text-stone-800">
                        No products match &ldquo;{navSearch}&rdquo;
                      </p>
                      <p className="mt-1 text-[11px] text-stone-500">
                        Try searching for &ldquo;phone&rdquo;, &ldquo;shirt&rdquo;, or &ldquo;electronics&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link Button with Live Item Count */}
            <Link
              to="/wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-stone-900"
              aria-label={`Wishlist (${wishlistCount} items)`}
              title="Saved Items (Wishlist)"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Link Button with Live Item Count */}
            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-stone-900"
              aria-label={`Shopping cart (${cartCount} items)`}
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
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown Menu or Sign in/Join buttons */}
            <div className="relative" ref={accountMenuRef}>
              {token ? (
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 text-stone-700 transition hover:bg-stone-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-stone-900"
                  aria-label="User account menu"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-900 text-xs font-bold text-white shadow-xs">
                    {profile.image ? (
                      <img src={profile.image} alt={profile.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      profileInitials
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-stone-800">
                    {profile.name ? profile.name.split(" ")[0] : "Account"}
                  </span>
                  <span className="hidden lg:inline text-[9px] text-stone-400">▼</span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition focus-visible:outline-2 focus-visible:outline-stone-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-stone-900"
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* Account Dropdown Popover */}
              {accountMenuOpen && token && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-stone-200/90 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <div className="border-b border-stone-100 px-3 py-2.5 mb-1">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {profile.name || "Customer Account"}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {profile.email || "customer@mystore.com"}
                    </p>
                    {isAdmin && (
                      <span className="mt-1 inline-block rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-800">
                        Store Admin
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition focus-visible:outline-2 focus-visible:outline-stone-900"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <span>👤</span>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition focus-visible:outline-2 focus-visible:outline-stone-900"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <span>📦</span>
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition focus-visible:outline-2 focus-visible:outline-stone-900"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <span>❤️</span>
                      <span>Saved Items</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-200 transition focus-visible:outline-2 focus-visible:outline-stone-900"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <span>🛡️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="mt-2 border-t border-stone-100 pt-1">
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

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-700 transition hover:bg-stone-100 md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-stone-900"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE RESPONSIVE DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-200 bg-white px-4 py-4 md:hidden shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-20 text-xs text-stone-800 outline-none focus:border-stone-400 focus:bg-white"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
                🔍
              </span>
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-stone-900 px-3.5 py-1 text-[11px] font-semibold text-white"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation Items */}
          <div className="space-y-1">
            <Link
              to="/"
              className={`block rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                isHomeActive ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:bg-stone-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`block rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                isShopActive ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:bg-stone-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All Products
            </Link>

            {/* Mobile Categories Accordion */}
            <div className="py-2">
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Categories
              </p>
              <div className="mt-1 space-y-0.5">
                {storeCategories.map((cat) => (
                  <Link
                    key={cat.query}
                    to={`/products?category=${encodeURIComponent(cat.query)}`}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/wishlist"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Saved Items (Wishlist)</span>
              {wishlistCount > 0 && (
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Shopping Cart</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/orders"
              className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Orders
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="block rounded-xl bg-stone-100 px-3.5 py-2.5 text-xs font-bold text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                🛡️ Admin Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Auth Bar */}
          <div className="mt-4 border-t border-stone-100 pt-3">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-stone-100 py-2.5 text-center text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-center text-xs font-bold text-stone-700 hover:bg-stone-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-xl bg-stone-900 py-2.5 text-center text-xs font-bold text-white hover:bg-stone-800"
                  onClick={() => setMobileMenuOpen(false)}
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
