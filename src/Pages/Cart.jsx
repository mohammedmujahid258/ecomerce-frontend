import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import EmptyState from "../Components/EmptyState";
import ErrorState from "../Components/ErrorState";
import { notifyCartUpdated, notifyToast } from "../utils/cartWishlistEvents";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/cart");
      const fetchedCart = response.data?.cart ?? { items: [] };
      setCart(fetchedCart);

      const count = (fetchedCart.items || []).reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      notifyCartUpdated(count);
    } catch (err) {
      console.error("Error fetching cart:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in to view your cart.");
      } else {
        setError("Unable to load your shopping cart. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/cart")
      .then((response) => {
        if (!isMounted) return;
        const fetchedCart = response.data?.cart ?? { items: [] };
        setCart(fetchedCart);
        const count = (fetchedCart.items || []).reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        notifyCartUpdated(count);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching cart:", err);
        if (err.response?.status === 401) {
          setError("Your session has expired. Please sign in to view your cart.");
        } else {
          setError("Unable to load your shopping cart. Please check your internet connection.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Change quantity
  const handleQuantityChange = async (productId, currentQuantity, delta) => {
    const newQty = currentQuantity + delta;
    if (newQty < 1) return;

    setUpdatingId(productId);
    try {
      const response = await api.put("/cart", {
        productId,
        quantity: newQty,
      });
      const updated = response.data?.cart ?? { items: [] };
      setCart(updated);
      const count = (updated.items || []).reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      notifyCartUpdated(count);
    } catch (err) {
      console.error("Error changing quantity:", err);
      notifyToast(err.response?.data?.message || "Failed to update quantity", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove item
  const handleRemoveItem = async (productId, productName = "Item") => {
    setUpdatingId(productId);
    try {
      const response = await api.delete("/cart", {
        data: { productId },
      });
      const updated = response.data?.cart ?? { items: [] };
      setCart(updated);
      notifyToast(`Removed ${productName} from your cart`, "info");
      const count = (updated.items || []).reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      notifyCartUpdated(count);
    } catch (err) {
      console.error("Error removing item:", err);
      notifyToast("Failed to remove item", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12">
        <LoadingSpinner message="Loading your shopping cart..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12 px-4">
        <div className="mx-auto max-w-lg">
          <ErrorState
            title="Cart Error"
            message={error}
            onRetry={fetchCart}
          />
        </div>
      </main>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (total, item) => total + (Number(item.product?.price) || 0) * (item.quantity || 1),
    0
  );
  const freeShippingThreshold = 999;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const finalTotal = subtotal + shippingCost;

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Shopping Cart
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {items.length} {items.length === 1 ? "unique product" : "unique products"} in your bag
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your shopping cart is empty"
            description="Explore our catalog and find the best electronics, fashion, and lifestyle essentials."
            actionLabel="Discover Products"
            actionLink="/products"
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const prod = item.product || {};
                const itemTotal = (Number(prod.price) || 0) * (item.quantity || 1);
                const isUpdating = updatingId === prod._id;

                return (
                  <div
                    key={prod._id || item._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs"
                  >
                    {/* Thumbnail & Product Details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link
                        to={`/products/${prod._id}`}
                        className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-center"
                      >
                        <ProductImage
                          src={prod.image}
                          alt={prod.name || "Product"}
                          className="h-full w-full object-contain"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {prod.category || "General"}
                        </span>
                        <Link to={`/products/${prod._id}`}>
                          <h3 className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 transition">
                            {prod.name || "Unnamed Product"}
                          </h3>
                        </Link>
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          ₹{Number(prod.price || 0).toLocaleString("en-IN")} each
                        </p>
                        {prod.stock <= 3 && prod.stock > 0 && (
                          <span className="mt-1 inline-block text-[10px] font-bold text-amber-600">
                            Only {prod.stock} left in stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Item Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod._id, item.quantity, -1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod._id, item.quantity, 1)}
                          disabled={isUpdating || (prod.stock && item.quantity >= prod.stock)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm sm:text-base font-extrabold text-slate-900">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(prod._id, prod.name)}
                        disabled={isUpdating}
                        className="text-slate-400 hover:text-rose-600 transition p-1.5 cursor-pointer"
                        title="Remove product from cart"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Order Summary
                </h2>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="font-bold text-emerald-600">FREE</span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                      Add ₹{(freeShippingThreshold - subtotal).toLocaleString("en-IN")} more to qualify for Free Delivery!
                    </p>
                  )}

                  <div className="border-t border-slate-100 pt-3 flex justify-between text-sm sm:text-base font-extrabold text-slate-900">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="mt-6 w-full rounded-xl bg-slate-900 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-98 cursor-pointer"
                >
                  Proceed to Checkout &rarr;
                </button>

                {/* Guarantee notes */}
                <div className="mt-5 space-y-2 text-[11px] text-slate-500 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>100% Secure Checkout Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Easy 30-day replacement support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
