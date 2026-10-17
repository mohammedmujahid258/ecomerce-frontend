import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import { notifyToast } from "../utils/cartWishlistEvents";

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PrinterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/orders")
      .then((response) => {
        if (!isMounted) return;
        const list = response.data.orders ?? response.data.data ?? [];
        const found = list.find((o) => o._id === id);

        if (found) {
          setOrder(found);
          setError("");
        } else {
          // Fallback: try direct ID lookup if backend provides it
          api
            .get(`/orders/${id}`)
            .then((directRes) => {
              if (!isMounted) return;
              const directOrder = directRes.data?.order || directRes.data;
              if (directOrder?._id) {
                setOrder(directOrder);
                setError("");
              } else {
                setError("Order not found. You can only view orders associated with your account.");
              }
            })
            .catch(() => {
              if (isMounted) {
                setError("Order not found. You can only view orders associated with your account.");
              }
            });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error retrieving order details:", err);
        setError("Unable to retrieve order details. Please verify your connection.");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, retryKey]);

  const copyOrderId = () => {
    if (order?._id) {
      navigator.clipboard?.writeText(order._id);
      notifyToast("Order ID copied to clipboard", "info");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Status mapping for progress timeline
  const statusInfo = useMemo(() => {
    const raw = (order?.status || "pending").toLowerCase();
    const isCancelled = raw === "cancelled";

    // Standard progression: 1. Placed -> 2. Confirmed -> 3. Shipped -> 4. Delivered
    let currentStep = 1;
    if (raw === "confirmed") currentStep = 2;
    if (raw === "shipped") currentStep = 3;
    if (raw === "delivered") currentStep = 4;

    return {
      raw,
      isCancelled,
      currentStep,
    };
  }, [order?.status]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Retrieving order receipt and tracking milestones..." />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-16 px-4">
        <div className="mx-auto max-w-lg rounded-3xl border border-stone-200/90 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-600 mb-4">
            🔒
          </div>
          <h1 className="font-editorial text-2xl font-bold text-stone-900">
            Order Access Restricted
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">
            {error || "We could not find this order or you do not have permission to view it."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRetryKey((k) => k + 1);
              }}
              className="w-full sm:w-auto rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition cursor-pointer"
            >
              ↻ Try Again
            </button>
            <Link
              to="/orders"
              className="w-full sm:w-auto rounded-full border border-stone-300 px-6 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              &larr; View My Orders
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto rounded-full border border-stone-300 px-6 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items = order.items || [];
  const totalAmount = Number(order.totalAmount ?? order.total ?? 0);
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const discountAmount = Math.max(0, itemsSubtotal - totalAmount);
  const addr = order.shippingAddress;
  const paymentMethod = order.paymentMethod || order.payment?.paymentMethod || "Cash on Delivery";
  const orderDateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Recent";

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/orders" className="hover:text-stone-900 transition">
              Orders
            </Link>
            <span>/</span>
            <span className="font-mono font-bold text-stone-900">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </nav>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition cursor-pointer print:hidden"
            >
              <PrinterIcon />
              <span>Print Invoice</span>
            </button>
            <Link
              to="/orders"
              className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition print:hidden"
            >
              &larr; All Orders
            </Link>
          </div>
        </div>

        {/* Invoice Header Card */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                Official Receipt & Order Summary
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-1 text-xs text-stone-500">
                Placed on <strong className="text-stone-800">{orderDateStr}</strong>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[11px] text-stone-400">
                  ID: {order._id}
                </span>
                <button
                  type="button"
                  onClick={copyOrderId}
                  className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                  title="Copy Full ID"
                  aria-label="Copy Full ID"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">
                Total Confirmed
              </span>
              <p className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
              <span
                className={`inline-block mt-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                  statusInfo.isCancelled
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : statusInfo.raw === "delivered"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                ● {statusInfo.raw}
              </span>
            </div>
          </div>

          {/* Fulfillment Progression Timeline */}
          <div className="mt-6 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-5">
              Fulfillment Status
            </h2>

            {statusInfo.isCancelled ? (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold">This order has been cancelled.</p>
                  <p className="text-[11px] mt-0.5 text-rose-600">
                    If payment was captured online, your refund will be processed to the original payment source within 3–5 banking days.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { step: 1, label: "Order Placed", desc: "Received by store" },
                  { step: 2, label: "Confirmed", desc: "Items reserved" },
                  { step: 3, label: "Dispatched", desc: "Handed to courier" },
                  { step: 4, label: "Delivered", desc: "Completed" },
                ].map(({ step, label, desc }) => {
                  const isCompleted = statusInfo.currentStep >= step;
                  const isCurrent = statusInfo.currentStep === step;

                  return (
                    <div
                      key={step}
                      className={`relative rounded-2xl p-4 border transition ${
                        isCurrent
                          ? "border-stone-900 bg-stone-50/80 shadow-xs ring-1 ring-stone-900"
                          : isCompleted
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-stone-200/80 bg-white opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {isCompleted ? <CheckIcon className="w-3.5 h-3.5" /> : step}
                        </div>
                        <span className="font-bold text-xs text-stone-900">{label}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500 pl-8">{desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Purchased Products Table (Confirmed Historical Prices) */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h2 className="font-editorial text-xl font-bold text-stone-900">
              Purchased Products ({items.length})
            </h2>
            <span className="text-xs text-stone-400">
              Prices confirmed at time of purchase
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {items.map((item, idx) => {
              const prod = item.product || {};
              const prodId = prod._id || prod.id || item.productId;
              const prodName = prod.name || item.name || "Purchased Product";
              const historicalPrice = Number(item.price ?? prod.price ?? 0);
              const qty = Number(item.quantity || 1);
              const subtotal = historicalPrice * qty;

              return (
                <div
                  key={item._id || prodId || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-18 w-18 shrink-0 overflow-hidden rounded-2xl bg-stone-50 p-2 border border-stone-200">
                      <ProductImage
                        src={prod.image || item.image}
                        alt={prodName}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {prodId ? (
                        <Link
                          to={`/products/${prodId}`}
                          className="font-bold text-stone-900 hover:text-stone-600 transition text-sm truncate block"
                          title={prodName}
                        >
                          {prodName}
                        </Link>
                      ) : (
                        <p className="font-bold text-stone-900 text-sm truncate" title={prodName}>
                          {prodName}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-stone-500">
                        Historical Unit Price: ₹{historicalPrice.toLocaleString("en-IN")} &times; {qty} {qty === 1 ? "unit" : "units"}
                      </p>
                      {prod.category && (
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          {prod.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Item Subtotal
                      </span>
                      <span className="font-bold text-stone-900 text-sm sm:text-base">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {prodId && (
                      <Link
                        to={`/products/${prodId}`}
                        className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition print:hidden"
                      >
                        Buy Again
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Grid: Shipping Address & Financial Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Shipping & Delivery Address Card */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
              <span>📍</span> Delivery Destination
            </h3>

            {addr ? (
              <div className="space-y-2 text-xs text-stone-600">
                <p className="font-bold text-stone-900 text-sm">
                  {addr.fullname || addr.fullName || addr.name || "Customer Name"}
                </p>
                <p className="leading-relaxed">
                  {addr.street || addr.address || "Street address on record"}
                </p>
                <p>
                  {[addr.city, addr.state, addr.postalCode || addr.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {addr.phone && (
                  <p className="pt-2 text-stone-700 flex items-center gap-1.5">
                    <span>📞</span>
                    <span>{addr.phone}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                Standard delivery destination associated with your user profile.
              </p>
            )}
          </div>

          {/* Payment Details & Cost Breakdown */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
              <span>💳</span> Financial & Payment Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">
                  ₹{itemsSubtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Applied Promotional Discount</span>
                  <span className="font-bold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Standard Express Shipping</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>

              <div className="border-t border-stone-100 pt-3 flex justify-between text-sm">
                <span className="font-bold text-stone-900">Total Confirmed</span>
                <span className="font-editorial text-lg font-bold text-stone-900">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-stone-600 space-y-1">
                <p className="flex justify-between">
                  <span className="text-stone-400">Payment Method:</span>
                  <strong className="text-stone-800">{paymentMethod}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-stone-400">Payment Status:</span>
                  <strong className="text-stone-800 capitalize">
                    {order.paymentStatus || (statusInfo.raw === "delivered" ? "Paid" : "Confirmed")}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-stone-200/80 print:hidden">
          <Link
            to="/orders"
            className="text-xs font-bold text-stone-700 hover:text-stone-900 hover:underline"
          >
            &larr; Return to All Orders
          </Link>

          <Link
            to="/products"
            className="rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 text-center transition"
          >
            Continue Shopping Catalog
          </Link>
        </div>
      </div>
    </main>
  );
}
