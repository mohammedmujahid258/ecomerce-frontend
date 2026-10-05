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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">M</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            My<span className="text-[#a48500]">Store</span>
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleNavSearch} className="hidden md:flex items-center mx-4 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8]"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Mobile Quick Action Icons (Wishlist, Cart, Menu) */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-sm hover:bg-[#fff7d6]"
            title="Wishlist"
          >
            ❤️
          </Link>
          <Link
            to="/cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-sm hover:bg-[#fff7d6]"
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

        {/* Desktop Links & Auth */}
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

      {/* Mobile Search Bar - PERMANENTLY VISIBLE on mobile devices */}
      <div className="mt-2.5 block md:hidden">
        <form onSubmit={handleNavSearch} className="flex w-full items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-2 focus:ring-[#fff0a8]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

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
