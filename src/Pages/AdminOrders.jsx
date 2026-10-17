import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import AdminLayout from "../Components/AdminLayout";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders/all");
      setOrders(res.data?.orders ?? []);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      setError("Unable to retrieve customer orders from server.");
      notifyToast("Failed to fetch orders list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/orders/all")
      .then((res) => {
        if (isMounted) setOrders(res.data?.orders ?? []);
      })
      .catch((err) => {
        console.error("Error fetching admin orders:", err);
        if (isMounted) {
          setError("Unable to retrieve customer orders from server.");
          notifyToast("Failed to fetch orders list", "error");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      const updated = response.data?.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated || { ...o, status: newStatus } : o))
      );
      notifyToast(`Order #${orderId.slice(-6).toUpperCase()} status updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Error updating order status:", err);
      notifyToast(err.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Status counts
  const countsByStatus = useMemo(() => {
    const counts = { all: orders.length, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      const s = (o.status || "pending").toLowerCase();
      if (counts[s] !== undefined) {
        counts[s] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (selectedStatusFilter !== "all") {
        const current = (o.status || "pending").toLowerCase();
        if (current !== selectedStatusFilter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (o._id || "").toLowerCase().includes(q);
        const matchesName = (o.user?.name || "").toLowerCase().includes(q);
        const matchesEmail = (o.user?.email || "").toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail) return false;
      }

      return true;
    });
  }, [orders, selectedStatusFilter, searchQuery]);

  const getStatusBadgeStyle = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-stone-100 text-stone-800 border-stone-300";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <AdminLayout
      title="Orders & Fulfillment"
      subtitle="Inspect customer purchases, delivery destinations, and update dispatch stages"
      breadcrumbs={["Orders"]}
      actions={
        <button
          type="button"
          onClick={fetchOrders}
          className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
        >
          ↻ Refresh
        </button>
      }
    >
      <div className="space-y-6">
        {/* Status Filter Tabs & Search Bar */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Status pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "All Orders" },
                { key: "pending", label: "Pending" },
                { key: "confirmed", label: "Confirmed" },
                { key: "shipped", label: "Shipped" },
                { key: "delivered", label: "Delivered" },
                { key: "cancelled", label: "Cancelled" },
              ].map(({ key, label }) => {
                const count = countsByStatus[key] || 0;
                const active = selectedStatusFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedStatusFilter(key)}
                    className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-stone-900 text-white shadow-xs"
                        : "bg-stone-50 border border-stone-200/80 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        active ? "bg-stone-700 text-stone-200" : "bg-stone-200/70 text-stone-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, name, email..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-xs">
            <ErrorState title="Orders Service" message={error} onRetry={fetchOrders} />
          </div>
        )}

        {/* Orders Listing */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Fetching customer order records..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl text-stone-500 mb-3">
              🛍️
            </div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              No orders found
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              {searchQuery || selectedStatusFilter !== "all"
                ? "No customer transactions match your filter criteria."
                : "No customer orders have been placed yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const customerName = order.user?.name || "Customer";
              const customerEmail = order.user?.email || "Unknown email";
              const isUpdating = updatingOrderId === order._id;
              const dateFormatted = order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Recent Transaction";

              const addr = order.shippingAddress;

              return (
                <div
                  key={order._id}
                  className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:border-stone-300"
                >
                  {/* Top Bar of Order Card */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-100 pb-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-stone-300">&bull;</span>
                        <span className="text-xs text-stone-500">{dateFormatted}</span>
                        <span className="text-stone-300">&bull;</span>
                        <span
                          className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {order.status || "pending"}
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-stone-900">
                        {customerName}{" "}
                        <span className="font-normal text-stone-500">({customerEmail})</span>
                      </h3>
                    </div>

                    {/* Total & Inline Status Dropdown */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                          Total Amount
                        </span>
                        <span className="font-editorial text-lg font-bold text-stone-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Status select with instant backend sync */}
                      <div className="relative">
                        <select
                          value={order.status || "pending"}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-800 outline-none focus:border-stone-900 cursor-pointer disabled:opacity-50 transition"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {isUpdating && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping address info if present */}
                  {addr && (
                    <div className="mt-4 rounded-2xl bg-stone-50/70 p-3.5 border border-stone-100 text-xs text-stone-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-bold text-stone-800">📍 Destination:</span>
                      <span>
                        {addr.street || addr.address || ""}, {addr.city || ""}, {addr.state || ""} {addr.postalCode || addr.pincode || ""}
                      </span>
                      {addr.phone && (
                        <span className="text-stone-500">📞 {addr.phone}</span>
                      )}
                    </div>
                  )}

                  {/* Items Grid */}
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Purchased Items ({(order.items || []).length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(order.items || []).map((item, idx) => {
                        const prod = item.product || {};
                        const prodName = prod.name || item.name || "Catalog Product";
                        const prodPrice = item.price ?? prod.price ?? 0;

                        return (
                          <div
                            key={item._id || idx}
                            className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-stone-200/80"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-50 p-1 border border-stone-200">
                              <ProductImage
                                src={prod.image || item.image}
                                alt={prodName}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              {prod._id ? (
                                <Link
                                  to={`/products/${prod._id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-stone-900 truncate hover:text-stone-600 block"
                                  title={prodName}
                                >
                                  {prodName}
                                </Link>
                              ) : (
                                <p className="text-xs font-bold text-stone-900 truncate" title={prodName}>
                                  {prodName}
                                </p>
                              )}
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Qty: <strong className="text-stone-800">{item.quantity}</strong> &times; ₹{Number(prodPrice).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
