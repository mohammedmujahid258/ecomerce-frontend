import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import AdminLayout from "../Components/AdminLayout";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import { notifyToast } from "../utils/cartWishlistEvents";

function StatCard({ label, value, subtext, icon, trend = null, isCurrency = false, unavailable = false }) {
  return (
    <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:border-stone-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 text-lg">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        {unavailable ? (
          <p className="text-lg font-bold text-stone-400">Data Unavailable</p>
        ) : (
          <p className="font-editorial text-3xl font-bold tracking-tight text-stone-900">
            {isCurrency && "₹"}
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </p>
        )}
        {subtext && (
          <p className="mt-1 text-xs text-stone-500 flex items-center gap-1.5">
            {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
            <span>{subtext}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Master PIN state
  const [currentPin, setCurrentPin] = useState(
    () => localStorage.getItem("admin_master_pin") || "1234"
  );
  const [newPin, setNewPin] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);

  // Live backend stats state
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [errorStatus, setErrorStatus] = useState({
    products: false,
    orders: false,
    users: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setLoading(true);

      const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
        api.get("/products"),
        api.get("/orders/all"),
        api.get("/users/all"),
      ]);

      if (!isMounted) return;

      const newErrorStatus = { products: false, orders: false, users: false };

      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.data?.products ?? []);
      } else {
        console.error("Dashboard error fetching products:", productsRes.reason);
        newErrorStatus.products = true;
      }

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.data?.orders ?? []);
      } else {
        console.error("Dashboard error fetching orders:", ordersRes.reason);
        newErrorStatus.orders = true;
      }

      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data?.users ?? []);
      } else {
        console.error("Dashboard error fetching users:", usersRes.reason);
        newErrorStatus.users = true;
      }

      setErrorStatus(newErrorStatus);
      setLoading(false);
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLockSession = () => {
    sessionStorage.removeItem("admin_pin_verified");
    notifyToast("Admin session locked", "info");
    navigate("/admin");
    window.location.reload();
  };

  const handleUpdatePin = (event) => {
    event.preventDefault();
    if (newPin.trim().length < 4 || newPin.trim().length > 8) {
      notifyToast("Security PIN must be between 4 and 8 digits", "warning");
      return;
    }
    localStorage.setItem("admin_master_pin", newPin.trim());
    setCurrentPin(newPin.trim());
    setNewPin("");
    setShowPinChange(false);
    notifyToast("Master Security PIN updated successfully!", "success");
  };

  // Real data calculations (Never invent numbers!)
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const totalUsersCount = users.length;

  // Filter out cancelled orders for real revenue calculation
  const validOrders = orders.filter((o) => (o.status || "").toLowerCase() !== "cancelled");
  const actualRevenue = validOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  // Low stock items: items with stock <= 5
  const lowStockProducts = products
    .filter((p) => (p.stock ?? 0) <= 5)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  // Recent 5 orders sorted by creation time
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-stone-100 text-stone-800 border-stone-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <AdminLayout
      title="Executive Overview"
      subtitle="Real-time catalog metrics, gross transaction volumes, and inventory alerts"
      breadcrumbs={["Overview"]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLockSession}
            className="flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:text-rose-600 transition cursor-pointer"
          >
            <span>🔒</span>
            <span>Lock Session</span>
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Aggregating live store intelligence..." />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Performance Indicators (Real Data Only) */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Gross Revenue"
                value={actualRevenue}
                isCurrency={true}
                icon="💰"
                subtext={`From ${validOrders.length} fulfilled orders`}
                unavailable={errorStatus.orders}
              />
              <StatCard
                label="Total Orders"
                value={totalOrdersCount}
                icon="🛍️"
                subtext={`${orders.filter((o) => (o.status || "").toLowerCase() === "pending").length} awaiting fulfillment`}
                unavailable={errorStatus.orders}
              />
              <StatCard
                label="Catalog Products"
                value={totalProductsCount}
                icon="📦"
                subtext={`${lowStockProducts.length} low-stock warnings`}
                unavailable={errorStatus.products}
              />
              <StatCard
                label="Registered Users"
                value={totalUsersCount}
                icon="👥"
                subtext={`${users.filter((u) => (u.role || "").toLowerCase() === "admin").length} administrators`}
                unavailable={errorStatus.users}
              />
            </div>
          </section>

          {/* Quick Management Navigation Grid */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
              Operational Management
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                to="/admin/products"
                className="group flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:border-stone-400 hover:shadow-md"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 text-2xl group-hover:scale-105 transition">
                    📦
                  </div>
                  <h3 className="mt-4 font-editorial text-lg font-bold text-stone-900 group-hover:text-stone-700">
                    Product Inventory
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                    Create new listings with photograph uploads, adjust unit prices, track stock levels, and archive discontinued items.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-bold text-stone-900 group-hover:text-stone-700">
                  <span>Manage Catalog ({totalProductsCount})</span>
                  <span>&rarr;</span>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="group flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:border-stone-400 hover:shadow-md"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 text-2xl group-hover:scale-105 transition">
                    🛍️
                  </div>
                  <h3 className="mt-4 font-editorial text-lg font-bold text-stone-900 group-hover:text-stone-700">
                    Orders Fulfillment
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                    Track customer purchases, review delivery shipping addresses, and update fulfillment statuses in real-time.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-bold text-stone-900 group-hover:text-stone-700">
                  <span>Manage Orders ({totalOrdersCount})</span>
                  <span>&rarr;</span>
                </div>
              </Link>

              <Link
                to="/admin/all/users"
                className="group flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:border-stone-400 hover:shadow-md"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 text-2xl group-hover:scale-105 transition">
                    👥
                  </div>
                  <h3 className="mt-4 font-editorial text-lg font-bold text-stone-900 group-hover:text-stone-700">
                    User Accounts
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                    Review registered customer profiles, emails, unique IDs, and administrative role assignments across the platform.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-bold text-stone-900 group-hover:text-stone-700">
                  <span>View Directory ({totalUsersCount})</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Low Stock Alerts & Recent Orders Dual Grid */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Low-Stock Products Card */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span>⚠️</span> Low-Stock Inventory Alerts
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Items with 5 or fewer units remaining in stock
                  </p>
                </div>
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-stone-700 hover:text-stone-900 hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="mt-4">
                {lowStockProducts.length === 0 ? (
                  <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-6 text-center">
                    <p className="text-xs font-bold text-emerald-800">
                      ✓ Optimal Inventory Health
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600">
                      All catalog items currently have adequate stock levels (&gt; 5 units).
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {lowStockProducts.slice(0, 5).map((prod) => {
                      const isOutOfStock = (prod.stock ?? 0) <= 0;
                      return (
                        <div
                          key={prod._id}
                          className="flex items-center justify-between py-3 gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-1">
                              <ProductImage
                                src={prod.image}
                                alt={prod.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-stone-500">
                                ₹{Number(prod.price || 0).toLocaleString("en-IN")} &bull;{" "}
                                <span className="capitalize">{prod.category || "General"}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border ${
                                isOutOfStock
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : `${prod.stock} left`}
                            </span>
                            <Link
                              to="/admin/products"
                              className="rounded-lg border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
                            >
                              Restock
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Card */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span>🛍️</span> Recent Customer Orders
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Latest incoming transactions and fulfillment states
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-xs font-semibold text-stone-700 hover:text-stone-900 hover:underline"
                >
                  All Orders &rarr;
                </Link>
              </div>

              <div className="mt-4">
                {recentOrders.length === 0 ? (
                  <div className="rounded-2xl bg-stone-50 p-6 text-center text-xs text-stone-500">
                    No orders have been recorded yet in store database.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {recentOrders.map((ord) => {
                      const customerName = ord.user?.name || "Customer";
                      const dateStr = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent";

                      return (
                        <div
                          key={ord._id}
                          className="flex items-center justify-between py-3 gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-stone-900">
                                #{ord._id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-[11px] text-stone-400">&bull;</span>
                              <span className="text-[11px] text-stone-500">{dateStr}</span>
                            </div>
                            <p className="text-xs text-stone-600 truncate mt-0.5">
                              {customerName} &bull; {(ord.items || []).length} items
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-stone-900">
                              ₹{Number(ord.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                            <span
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                                ord.status
                              )}`}
                            >
                              {ord.status || "pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Master Security PIN Management */}
          <section className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>🔐</span> Master Security PIN Settings
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Secondary 2-factor code protecting administrative write actions. Current PIN:{" "}
                  <span className="font-mono font-bold text-stone-900">
                    {"•".repeat(currentPin.length)}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPinChange(!showPinChange)}
                className="self-start rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                {showPinChange ? "Cancel Changes" : "Update Security PIN"}
              </button>
            </div>

            {showPinChange && (
              <form onSubmit={handleUpdatePin} className="mt-5 border-t border-stone-100 pt-5 max-w-sm">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  New Master PIN (4 to 8 digits)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new PIN"
                    className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-stone-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-stone-800 cursor-pointer"
                  >
                    Save PIN
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}