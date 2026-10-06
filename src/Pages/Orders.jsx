import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrdersAndProducts = async () => {
      try {
        // Fetch orders and all products in parallel to resolve product images by ID
        const [ordersRes, productsRes] = await Promise.allSettled([
          api.get("/orders"),
          api.get("/products"),
        ]);

        if (ordersRes.status === "fulfilled") {
          setOrders(ordersRes.value.data.orders ?? ordersRes.value.data.data ?? []);
        } else {
          throw ordersRes.reason;
        }

        if (productsRes.status === "fulfilled") {
          const map = {};
          const list = productsRes.value.data.products ?? productsRes.value.data.data ?? [];
          list.forEach((prod) => {
            if (prod?._id) {
              map[prod._id] = prod;
            }
          });
          setProductMap(map);
        }
      } catch (requestError) {
        console.error("Error fetching orders:", requestError);
        setError("Unable to load your orders. Please log in and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndProducts();
  }, []);

  const getPaymentStatus = (order) =>
    order.paymentStatus ??
    order.payment?.status ??
    order.payment?.paymentStatus ??
    order.status ??
    "pending";

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "confirmed" || s === "paid" || s === "delivered") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (s === "failed" || s === "cancelled") {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  const formatAddress = (address) => {
    if (!address) return "Not provided";
    if (typeof address === "string") return address;
    return [
      address.fullname || address.fullName || address.name,
      address.phone,
      address.street || address.address,
      address.city,
      address.state,
      address.pincode || address.postalCode,
    ].filter(Boolean).join(", ") || "Not provided";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-4 sm:p-6 shadow-[0_24px_70px_rgb(32_32_22/18%)]">
        {/* Golden Mesh Header Banner - Matching Store Theme */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-6 sm:p-8 text-[#202016]">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#a48500]/25 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#202016]">✦</span>
                <p className="text-xs font-bold uppercase tracking-wider text-[#514810]">
                  Purchase History
                </p>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#202016]">
                My Orders 📦
              </h1>
              <p className="mt-1 text-xs text-[#514810]">
                View your purchases, track fulfillment, and review order status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-[#202016]/20 bg-white/80 px-4 py-2 text-xs font-bold text-[#202016] shadow-sm backdrop-blur-sm transition hover:bg-white hover:scale-[1.02] cursor-pointer active:scale-95"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="animate-pulse text-3xl font-black text-[#a48500]">✦</span>
            <p className="mt-3 text-sm font-bold text-[#202016]">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center text-xs font-bold text-rose-700 shadow-sm">
            <span className="mr-1 text-sm">⚠️</span>
            {error}
          </div>
        )}

        {/* Empty Orders State */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="text-5xl" role="img" aria-label="package">📦</span>
            <h2 className="mt-4 text-2xl font-black text-[#202016]">
              No orders found
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Your purchases and past orders will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e7b900] px-7 py-3 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white cursor-pointer active:scale-95"
            >
              <span>🛍️</span>
              <span>Start Shopping</span>
            </button>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getPaymentStatus(order);

            return (
              <section
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition hover:border-[#e7b900] hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Order ID
                    </p>
                    <p className="mt-0.5 break-all text-xs font-bold text-[#202016]">
                      #{order._id}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full border px-3.5 py-1 text-xs font-extrabold capitalize ${getStatusBadgeClass(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedOrder((current) => current === order._id ? null : order._id)}
                    className="rounded-lg border border-[#202016] bg-[#e7b900] px-3 py-1.5 text-xs font-bold text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white"
                  >
                    {expandedOrder === order._id ? "Hide details" : "View details"}
                  </button>
                </div>

                {/* Order Items with Images */}
                <div className="mt-4 space-y-3">
                  {(order.items ?? []).map((item) => {
                    const productId = item.product?._id || item.product;
                    const resolvedProduct =
                      typeof item.product === "object" && item.product?.image
                        ? item.product
                        : productMap[productId] || {};
                    const imageUrl =
                      resolvedProduct.image || item.product?.image || "";
                    const productName =
                      resolvedProduct.name ||
                      item.product?.name ||
                      "Product unavailable";
                    const itemPrice =
                      item.price ?? resolvedProduct.price ?? item.product?.price;

                    return (
                      <div
                        key={item._id || productId}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center"
                      >
                        {/* Image + Product Details */}
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 sm:h-28 sm:w-28">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={productName}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl">🛍️</span>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#202016] line-clamp-1">
                              {productName}
                            </p>
                            {itemPrice !== undefined && (
                              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                                ₹{itemPrice}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="text-right sm:text-right">
                          <span className="inline-block rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#202016] border border-slate-200">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-4 grid gap-3 rounded-xl border border-[#ffe88a] bg-[#fffdf0] p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order date</p>
                      <p className="mt-1 font-semibold text-[#202016]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</p>
                      <p className="mt-1 font-semibold text-[#202016]">
                        {order.paymentMethod || order.payment?.method || "Not available"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery address</p>
                      <p className="mt-1 font-semibold text-[#202016]">
                        {formatAddress(order.shippingAddress || order.deliveryAddress || order.address)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Total */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order total
                  </span>
                  <span className="text-xl font-black text-[#202016]">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Orders;
