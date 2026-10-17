import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import EmptyState from "../Components/EmptyState";
import ErrorState from "../Components/ErrorState";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/orders");
      const list = response.data.orders ?? response.data.data ?? [];
      setOrders(list);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Unable to load your orders. Please check that you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/orders")
      .then((response) => {
        if (!isMounted) return;
        const list = response.data.orders ?? response.data.data ?? [];
        setOrders(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching orders:", err);
        setError("Unable to load your orders. Please check that you are signed in.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status = "pending") => {
    const s = String(status).toLowerCase();
    if (s === "delivered" || s === "paid" || s === "confirmed") {
      return (
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          ● {s.charAt(0).toUpperCase() + s.slice(1)}
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
          ● Shipped
        </span>
      );
    }
    if (s === "cancelled" || s === "failed") {
      return (
        <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
          ● {s.charAt(0).toUpperCase() + s.slice(1)}
        </span>
      );
    }
    return (
      <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
        ● Processing
      </span>
    );
  };

  const formatAddress = (addr) => {
    if (!addr) return "Standard delivery address";
    if (typeof addr === "string") return addr;
    return [
      addr.fullname || addr.fullName || addr.name,
      addr.phone,
      addr.street || addr.address,
      addr.city,
      addr.state,
      addr.pincode || addr.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12">
        <LoadingSpinner message="Loading your orders..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12 px-4">
        <div className="mx-auto max-w-lg">
          <ErrorState title="Orders Error" message={error} onRetry={fetchOrders} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              My Orders & Purchases
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track the progress and history of your {orders.length} {orders.length === 1 ? "order" : "orders"}.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            &larr; Shop More Products
          </Link>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="You haven't placed any orders yet"
            description="When you order products from MyStore, you will be able to track status, shipping, and receipt details right here."
            actionLabel="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              const items = order.items || [];
              const totalAmount = order.totalAmount ?? order.total ?? 0;
              const status = order.status || order.paymentStatus || "confirmed";

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:px-6 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Order Placed
                        </span>
                        <p className="font-semibold text-slate-900">{orderDate}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Total Amount
                        </span>
                        <p className="font-extrabold text-slate-900">
                          ₹{Number(totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Order Number
                        </span>
                        <p className="font-mono font-semibold text-slate-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(status)}</div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-slate-100 p-4 sm:p-6">
                    {items.map((item) => {
                      const prod = item.product || {};
                      const prodId = prod._id || prod.id || item.productId;

                      return (
                        <div
                          key={item._id || prodId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 p-2 border border-slate-100">
                              <ProductImage
                                src={prod.image}
                                alt={prod.name || "Product"}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <div>
                              <Link
                                to={`/products/${prodId}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition"
                              >
                                {prod.name || "Purchased Product"}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">
                                Quantity: {item.quantity || 1} &bull; ₹{item.price || prod.price}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              to={`/products/${prodId}`}
                              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                            >
                              View Product
                            </Link>
                            <Link
                              to={`/products/${prodId}`}
                              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800"
                            >
                              Leave Review ★
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Info Footer */}
                  {order.shippingAddress && (
                    <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-3 sm:px-6 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Delivered to: </span>
                      <span>{formatAddress(order.shippingAddress)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
