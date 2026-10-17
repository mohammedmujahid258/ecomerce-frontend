import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import EmptyState from "../Components/EmptyState";
import ErrorState from "../Components/ErrorState";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/orders");
      const list = response.data.orders ?? response.data.data ?? [];
      setOrders(list);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Unable to load your orders. Please check your network connection and sign-in status.");
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
        setError("Unable to load your orders. Please check your network connection and sign-in status.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const copyOrderId = (id) => {
    navigator.clipboard?.writeText(id);
    notifyToast("Order ID copied to clipboard", "info");
  };

  const getStatusBadge = (status = "pending") => {
    const s = String(status).toLowerCase();
    switch (s) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Shipped
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-300 px-3 py-1 text-xs font-bold text-stone-800">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-600" />
            Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Processing
          </span>
        );
    }
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

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all") {
        const s = (order.status || "pending").toLowerCase();
        if (statusFilter === "processing") {
          if (s !== "pending" && s !== "confirmed") return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }

      // Search filter (Order ID or product name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (order._id || "").toLowerCase().includes(q);
        const matchesItems = (order.items || []).some((item) => {
          const name = item.product?.name || item.name || "";
          return name.toLowerCase().includes(q);
        });
        if (!matchesId && !matchesItems) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Retrieving your order history..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-16 px-4">
        <div className="mx-auto max-w-lg">
          <ErrorState title="Orders Unavailable" message={error} onRetry={fetchOrders} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-stone-500">
          <Link to="/" className="hover:text-stone-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/profile" className="hover:text-stone-900 transition">
            My Account
          </Link>
          <span>/</span>
          <span className="font-semibold text-stone-900">Orders</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-stone-200/90 pb-6">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              My Orders & Purchases
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-600">
              Track the progress, delivery status, and historical invoices for your purchases ({orders.length} {orders.length === 1 ? "order" : "orders"} on record).
            </p>
          </div>

          <Link
            to="/products"
            className="self-start sm:self-auto rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition"
          >
            Continue Shopping &rarr;
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-12 shadow-xs text-center">
            <EmptyState
              icon="🛍️"
              title="You haven't placed any orders yet"
              description="Explore our curated catalog of high-quality products and place your first order. Track deliveries and view confirmed receipts right here."
              actionLabel="Start Exploring Catalog"
              actionLink="/products"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs">
              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: "All Orders" },
                  { key: "processing", label: "Processing" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" },
                  { key: "cancelled", label: "Cancelled" },
                ].map(({ key, label }) => {
                  const active = statusFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatusFilter(key)}
                      className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                        active
                          ? "bg-stone-900 text-white shadow-xs"
                          : "bg-stone-50 border border-stone-200/80 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order # or product..."
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

            {/* Filtered list result notice */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-stone-200/90 bg-white p-12 text-center shadow-xs">
                <p className="font-editorial text-lg font-bold text-stone-900">
                  No orders match your filter
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Try clearing your search query or selecting a different status category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
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
                  const paymentMethod = order.paymentMethod || (order.payment?.paymentMethod) || "Cash on Delivery";

                  return (
                    <article
                      key={order._id}
                      className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition hover:border-stone-300"
                    >
                      {/* Order Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 bg-stone-50/70 p-5 sm:px-6 text-xs text-stone-600">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              Order Placed
                            </span>
                            <p className="font-semibold text-stone-900 mt-0.5">{orderDate}</p>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              Total Confirmed
                            </span>
                            <p className="font-bold text-stone-900 mt-0.5">
                              ₹{Number(totalAmount).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              Order Identifier
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono font-bold text-stone-900">
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyOrderId(order._id)}
                                title="Copy Order ID"
                                className="text-stone-400 hover:text-stone-700 cursor-pointer text-[10px]"
                                aria-label="Copy Order ID"
                              >
                                📋
                              </button>
                            </div>
                          </div>

                          {paymentMethod && (
                            <div className="hidden md:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                Payment Method
                              </span>
                              <p className="font-semibold text-stone-700 mt-0.5">
                                {paymentMethod}
                              </p>
                            </div>
                          )}
                        </div>

                        <div>{getStatusBadge(status)}</div>
                      </div>

                      {/* Order Items List */}
                      <div className="divide-y divide-stone-100 p-5 sm:p-6">
                        {items.map((item, idx) => {
                          const prod = item.product || {};
                          const prodId = prod._id || prod.id || item.productId;
                          const itemName = prod.name || item.name || "Purchased Product";
                          const itemPrice = item.price ?? prod.price ?? 0;
                          const itemQty = item.quantity || 1;
                          const itemSubtotal = itemPrice * itemQty;

                          return (
                            <div
                              key={item._id || prodId || idx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-stone-50 p-2 border border-stone-200">
                                  <ProductImage
                                    src={prod.image || item.image}
                                    alt={itemName}
                                    className="h-full w-full object-contain"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  {prodId ? (
                                    <Link
                                      to={`/products/${prodId}`}
                                      className="text-xs sm:text-sm font-bold text-stone-900 hover:text-stone-600 transition truncate block"
                                      title={itemName}
                                    >
                                      {itemName}
                                    </Link>
                                  ) : (
                                    <p className="text-xs sm:text-sm font-bold text-stone-900 truncate" title={itemName}>
                                      {itemName}
                                    </p>
                                  )}
                                  <p className="mt-1 text-xs text-stone-500">
                                    Qty: <strong className="text-stone-800">{itemQty}</strong> &bull; ₹{Number(itemPrice).toLocaleString("en-IN")} each
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                <span className="font-bold text-stone-900 text-xs sm:text-sm">
                                  ₹{Number(itemSubtotal).toLocaleString("en-IN")}
                                </span>

                                {prodId && (
                                  <Link
                                    to={`/products/${prodId}`}
                                    className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                                  >
                                    Buy Again
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Footer with Details Link & Address */}
                      <div className="border-t border-stone-100 bg-stone-50/40 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                        <div className="text-stone-500 truncate max-w-lg">
                          {order.shippingAddress && (
                            <p className="truncate">
                              <span className="font-semibold text-stone-700">Shipping to: </span>
                              <span>{formatAddress(order.shippingAddress)}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <Link
                            to={`/orders/${order._id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition"
                          >
                            <span>View Order Details & Invoice</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
