import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notifyToast } from "../utils/cartWishlistEvents";

function DashboardIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function ProductsIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function OrdersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UsersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function LockIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MenuIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function AdminLayout({
  children,
  title = "Administration",
  subtitle = "Executive store management and operational controls",
  actions = null,
  breadcrumbs = [],
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const adminEmail = localStorage.getItem("user_email") || "admin@store.com";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLockSession = () => {
    sessionStorage.removeItem("admin_pin_verified");
    notifyToast("Admin session locked", "info");
    navigate("/admin");
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    sessionStorage.removeItem("admin_pin_verified");
    notifyToast("Signed out of administrative console", "info");
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      exact: true,
      icon: DashboardIcon,
    },
    {
      name: "Products & Stock",
      path: "/admin/products",
      activeMatch: (p) => p.startsWith("/admin/products"),
      icon: ProductsIcon,
    },
    {
      name: "Orders Fulfillment",
      path: "/admin/orders",
      activeMatch: (p) => p.startsWith("/admin/orders"),
      icon: OrdersIcon,
    },
    {
      name: "User Directory",
      path: "/admin/all/users",
      activeMatch: (p) => p.startsWith("/admin/all/users"),
      icon: UsersIcon,
    },
  ];

  const isNavActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    if (item.activeMatch) {
      return item.activeMatch(location.pathname);
    }
    return location.pathname === item.path;
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col md:flex-row">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Permanent, Mobile Slide-out) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-stone-200/90 bg-white p-6 transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-xs group-hover:scale-105 transition">
                A
              </div>
              <div>
                <span className="font-editorial text-lg font-bold tracking-tight text-stone-900 block leading-tight">
                  ATELIER
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">
                  Admin Console
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 md:hidden cursor-pointer"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="mt-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Management
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isNavActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                    }`}
                  >
                    <Icon className={active ? "text-white" : "text-stone-400"} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Store Links & Utilities */}
          <div className="mt-8">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Storefront
            </p>
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 transition"
              >
                <span className="flex items-center gap-3">
                  <ExternalLinkIcon className="text-stone-400" />
                  View Storefront
                </span>
                <span className="text-[10px] text-stone-400 font-mono">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Account & Lock */}
        <div className="pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-stone-50 p-3 border border-stone-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                {adminEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-stone-900">
                  {adminEmail}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-stone-500">
                    Admin Active
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLockSession}
              title="Lock Admin Session"
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
              aria-label="Lock Admin Session"
            >
              <LockIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-stone-200/90 bg-[#faf8f5]/90 px-4 sm:px-8 backdrop-blur-md">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-stone-200 bg-white p-2 text-stone-600 md:hidden hover:bg-stone-50 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </button>

            <div className="min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <Link to="/admin" className="hover:text-stone-900 transition">
                    Admin
                  </Link>
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                      <span>/</span>
                      <span className={idx === breadcrumbs.length - 1 ? "font-bold text-stone-700" : "hover:text-stone-900"}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              <h1 className="truncate font-editorial text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                {title}
              </h1>
            </div>
          </div>

          {/* Right: Actions & Account Menu */}
          <div className="flex items-center gap-3">
            {actions}

            {/* Account dropdown button */}
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 cursor-pointer"
                aria-expanded={accountMenuOpen}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">
                  {adminEmail[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline font-bold">Admin</span>
                <span className="text-[10px] text-stone-400">▼</span>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-stone-200/90 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                      Authenticated Administrator
                    </p>
                    <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                      {adminEmail}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-stone-700 hover:bg-stone-100/70 font-medium"
                    >
                      <span>Storefront Homepage</span>
                      <ExternalLinkIcon className="text-stone-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        handleLockSession();
                      }}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-stone-700 hover:bg-stone-100/70 font-medium cursor-pointer"
                    >
                      <span>Lock Security Session</span>
                      <LockIcon className="text-stone-400" />
                    </button>
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {subtitle && (
              <p className="text-xs text-stone-500 mb-6 -mt-2">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
