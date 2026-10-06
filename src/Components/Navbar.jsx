import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  } catch {
    return {};
  }
}

function MicIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3" /><path strokeLinecap="round" d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" /></svg>;
}

function CameraIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3.5" /></svg>;
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
  const isAdmin = userRole === "admin";
  const profile = getStoredProfile();
  const profileInitials = profile.name
    ? profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "U";
  const showLegacyMobileSearch = false;

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setMenuOpen(false);
    } else {
      navigate("/products");
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSearchMessage("Voice search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); setSearchMessage("Listening..."); };
    recognition.onresult = (event) => { setNavSearch(event.results[0][0].transcript); setSearchMessage(""); };
    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone access is blocked. Allow it in browser site settings.",
        "service-not-allowed": "Voice search is blocked by this browser.",
        "audio-capture": "No microphone was found or it is being used by another app.",
        "no-speech": "No speech detected. Please try again.",
        network: "Voice search needs an internet connection.",
      };
      setSearchMessage(messages[event.error] || `Voice search failed: ${event.error || "unknown error"}.`);
    };
    recognition.onend = () => setIsListening(false);
    try {
      recognition.start();
    } catch {
      setSearchMessage("Voice search could not start. Please try again.");
      setIsListening(false);
    }
  };

  const handleImageSearch = (event) => {
    if (event.target.files?.[0]) setSearchMessage("Image selected. Image search needs backend support.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    sessionStorage.removeItem("admin_pin_verified");
    navigate("/login");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Wishlist", path: "/wishlist" },
    { label: "Cart", path: "/cart" },
    { label: "My Orders", path: "/orders" },
  ];

  if (isAdmin) {
    navLinks.push({ label: "Admin Panel ⚙️", path: "/admin" });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          {token && (
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#e7b900] bg-[#fff7d6] text-[11px] font-black text-[#a48500] shadow-sm transition hover:scale-105"
              title="My Profile"
              aria-label="My Profile"
            >
              {profile.image ? (
                <img src={profile.image} alt="My profile" className="h-full w-full object-cover" />
              ) : (
                profileInitials
              )}
            </Link>
          )}
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">M</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            My<span className="text-[#a48500]">Store</span>
          </span>
          </Link>
        </div>

        {/* Desktop Quick Search Bar */}
        <form onSubmit={handleNavSearch} className="order-3 flex w-full items-center md:order-none md:mx-4 md:max-w-md md:flex-1">
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products, categories..."
              aria-label="Search products"
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-8 pr-36 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8] md:py-1.5"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true">🔍</span>
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <button type="button" onClick={handleVoiceSearch} aria-label="Voice search" title="Voice search" className={`rounded-full p-1.5 transition hover:bg-[#fff0a8] ${isListening ? "text-rose-600" : "text-slate-500"}`}><MicIcon /></button>
              <label htmlFor="image-search" aria-label="Search by image" title="Search by image" className="cursor-pointer rounded-full p-1.5 text-slate-500 transition hover:bg-[#fff0a8]">
                <CameraIcon />
                <input id="image-search" type="file" accept="image/*" onChange={handleImageSearch} className="hidden" />
              </label>
              <button type="submit" className="rounded-full bg-[#202016] px-3.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer">Search</button>
            </div>
          </div>
          {searchMessage && <span className="absolute mt-16 rounded-md bg-[#202016] px-2 py-1 text-[10px] text-white shadow md:mt-12">{searchMessage}</span>}
        </form>

        {/* Mobile Quick Action Buttons (Wishlist, Cart, Menu) */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/products"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm hover:bg-[#fff7d6]"
            title="Products"
          >
            🛍️
          </Link>
          <Link
            to="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm hover:bg-[#fff7d6]"
            title="Wishlist"
          >
            ❤️
          </Link>
          <Link
            to="/cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm hover:bg-[#fff7d6]"
            title="Cart"
          >
            🛒
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {/* Desktop Navigation Links & Auth Buttons */}
        <div className="hidden md:flex md:items-center md:gap-5">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link text-xs font-semibold uppercase tracking-wider transition ${
                location.pathname === path ? "active font-bold text-[#202016]" : "text-slate-600 hover:text-[#202016]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pl-2">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#202016] px-4 py-1.5 text-xs font-bold text-white shadow transition hover:bg-rose-600 cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-[#202016]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[#202016] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#e7b900] hover:text-[#202016]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - PERMANENTLY VISIBLE on mobile screens */}
      {showLegacyMobileSearch && (
      <div className="hidden">
        <form onSubmit={handleNavSearch} className="flex w-full items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true">🔍</span>
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:hidden">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                location.pathname === path
                  ? "bg-[#fff7d6] text-[#202016]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t border-slate-100 pt-3">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-[#202016] py-2.5 text-center text-xs font-bold text-white shadow cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl bg-[#202016] py-2 text-center text-xs font-bold text-white hover:bg-[#a48500]"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
