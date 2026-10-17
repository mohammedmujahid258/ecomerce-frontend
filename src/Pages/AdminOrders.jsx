import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/orders/all")
      .then((res) => {
        if (isMounted) setOrders(res.data?.orders ?? []);
      })
      .catch((error) => {
        console.error("Error fetching admin orders:", error);
        if (isMounted) notifyToast("Unable to fetch orders list", "error");
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
      notifyToast(`Order #${orderId.slice(-6)} status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      notifyToast(error.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === "all") return true;
    const current = (o.status || "pending").toLowerCase();
    return current === selectedStatusFilter.toLowerCase();
  });

  return (
    <main className="min-h-screen bg-slate-50/70 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Link to="/admin" className="hover:text-slate-900">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-900">Orders Management</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Customer Orders Fulfillment
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage status updates and track customer purchases ({orders.length} total orders).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              &larr; Admin Home
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatusFilter(st)}
              className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition cursor-pointer ${
                selectedStatusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {st === "all" ? "All Orders" : st}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No orders match the selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const customerName = order.user?.name || "Customer";
              const customerEmail = order.user?.email || "Unknown email";
              const isUpdating = updatingOrderId === order._id;

              return (
                <div
                  key={order._id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Recent"}
                        </span>
                      </div>
                      <h2 className="mt-1 text-sm font-bold text-slate-900">
                        {customerName}{" "}
                        <span className="font-normal text-slate-500">({customerEmail})</span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Total</span>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Status select */}
                      <select
                        value={order.status || "pending"}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-400 cursor-pointer disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(order.items || []).map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 rounded-2xl bg-slate-50/70 p-3 border border-slate-100"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white p-1 border border-slate-200">
                          <ProductImage
                            src={item.product?.image}
                            alt={item.product?.name || "Product"}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.product?.name || "Product"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity} &times; ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
