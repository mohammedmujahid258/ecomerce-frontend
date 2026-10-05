import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
  const isAdmin = userRole === "admin";

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setMenuOpen(false);
    } else {
      navigate("/products");
    }
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
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">M</span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              My<span className="text-[#a48500]">Store</span>
            </span>
          </Link>

          {/* Desktop Quick Search Bar with Search Button */}
          <form onSubmit={handleNavSearch} className="hidden md:flex items-center mx-4 flex-1 max-w-sm">
            <div className="relative w-full">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Mobile Right Controls: Quick Cart + Menu Toggle */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              to="/cart"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Shopping Cart"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* ALWAYS-VISIBLE MOBILE SEARCH BAR (Row 2 on phone) */}
        <form onSubmit={handleNavSearch} className="mt-2.5 flex md:hidden items-center w-full">
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products, categories..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
            {navSearch && (
              <button
                type="button"
                onClick={() => setNavSearch("")}
                className="absolute right-19 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } absolute left-0 top-full w-full flex-col gap-4 border-b border-[#202016] bg-[#e7b900] p-5 shadow-lg md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${location.pathname === path ? "active font-bold text-[#202016]" : ""}`}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 md:border-0 md:pt-0">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#202016] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-rose-600 cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="nav-link font-semibold text-slate-700 hover:text-[#202016]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-[#202016] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#e7b900] hover:text-[#202016]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
