import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}><span className="brand-mark">M</span><span className="text-lg font-extrabold tracking-tight text-slate-900">My<span className="text-indigo-600">Store</span></span></Link>
        <button className="rounded-lg p-2 text-slate-600 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><span className="text-xl">{menuOpen ? "×" : "☰"}</span></button>
        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-4 border-b border-slate-200 bg-white p-5 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
          {[['Home', '/'], ['Products', '/products'], ['Wishlist', '/wishlist'], ['Cart', '/cart'], ['My Orders', '/orders']].map(([label, path]) => <Link key={path} to={path} onClick={() => setMenuOpen(false)} className={`nav-link ${location.pathname === path ? "active" : ""}`}>{label}</Link>)}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 md:border-0 md:pt-0"><Link to="/login" onClick={() => setMenuOpen(false)} className="nav-link">Login</Link><Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">Get started</Link><button onClick={handleLogout} className="text-sm font-semibold text-slate-400 transition hover:text-rose-500">Logout</button></div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
