import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("user_role") || "").toLowerCase().trim();
  const isAdmin = userRole === "admin";

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
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">M</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            My<span className="text-[#a48500]">Store</span>
          </span>
        </Link>
        <button
          className="rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{menuOpen ? "×" : "☰"}</span>
        </button>
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-full w-full flex-col gap-4 border-b border-[#202016] bg-[#e7b900] p-5 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
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
