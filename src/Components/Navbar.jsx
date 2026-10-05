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
    <nav className="relative sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-5 py-4 pb-16 backdrop-blur-md sm:px-8 md:pb-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setMenuOpen(false)}>
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

        <button
          className="rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{menuOpen ? "×" : "☰"}</span>
        </button>
        <form onSubmit={handleNavSearch} className="absolute left-5 right-16 top-full mt-3 flex md:hidden">
          <div className="relative w-full">
            <input type="text" value={navSearch} onChange={(e) => setNavSearch(e.target.value)} placeholder="Search products..." aria-label="Search products" className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-9 pr-20 text-sm text-slate-800 placeholder-slate-400 outline-none shadow-sm focus:border-[#e7b900] focus:ring-2 focus:ring-[#fff0a8]" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" aria-hidden="true">🔍</span>
            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3.5 py-1.5 text-[11px] font-bold text-white">Search</button>
          </div>
        </form>
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-full w-full flex-col gap-4 border-b border-[#202016] bg-[#e7b900] p-5 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          {/* Mobile Search Bar */}
          <form onSubmit={handleNavSearch} className="hidden" style={{ display: "none" }}>
            <div className="relative w-full">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-slate-300 bg-white py-2 pl-8 pr-20 text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#202016] px-3.5 py-1 text-[11px] font-bold text-white"
              >
                Search
              </button>
            </div>
          </form>
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
