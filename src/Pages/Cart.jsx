import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import { notifyCartUpdated, notifyToast } from "../utils/cartWishlistEvents";

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function ShoppingBagIcon({ className = "w-10 h-10" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState(() => {
    return sessionStorage.getItem("cart_coupon_code") || "";
  });
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

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

  // Filter valid cart items
  const validItems = useMemo(() => {
    return (cart?.items || []).filter((item) => item && item.product);
  }, [cart]);

  // Calculations
  const totalItemCount = useMemo(() => {
    return validItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [validItems]);

  const subtotal = useMemo(() => {
    return validItems.reduce(
      (total, item) => total + (Number(item.product?.price) || 0) * (item.quantity || 1),
      0
    );
  }, [validItems]);

  const freeShippingThreshold = 999;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const rawPayable = Math.max(0, subtotal - discount);
  const finalTotal = rawPayable + (subtotal > 0 ? shippingCost : 0);
  const freeShippingDifference = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Change quantity bounded between 1 and available stock
  const handleQuantityChange = async (productId, currentQuantity, delta, maxStock) => {
    const newQty = currentQuantity + delta;
    if (newQty < 1) return;

    if (maxStock !== undefined && maxStock !== null && newQty > maxStock) {
      notifyToast(`Sorry, only ${maxStock} units are available in stock`, "warning");
      return;
    }

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
      console.error("Error updating cart quantity:", err);
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
      notifyToast(`Removed "${productName}" from your cart`, "info");
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

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = couponCode.trim();
    if (!cleanCode) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage("");
    try {
      const response = await api.post("/coupons/apply", {
        code: cleanCode,
        orderAmount: subtotal,
      });
      const d = Number(response.data?.discount || 0);
      setDiscount(d);
      setIsCouponApplied(true);
      sessionStorage.setItem("cart_coupon_code", cleanCode);
      setCouponMessage(response.data?.message || `Coupon applied! Saved ₹${d.toLocaleString("en-IN")}`);
      notifyToast(`Coupon "${cleanCode}" applied!`, "success");
    } catch (err) {
      setDiscount(0);
      setIsCouponApplied(false);
      setCouponMessage(err.response?.data?.message || "Invalid or expired coupon code.");
      notifyToast("Coupon could not be applied", "warning");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setIsCouponApplied(false);
    setCouponMessage("");
    sessionStorage.removeItem("cart_coupon_code");
    notifyToast("Coupon removed", "info");
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Loading your shopping cart..." />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <div className="mx-auto max-w-xl">
          <ErrorState
            title="Cart Unavailable"
            message={error}
            onRetry={fetchCart}
          />
          <div className="mt-6 text-center">
            {error.includes("sign in") ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800"
              >
                Sign In to Account &rarr;
              </Link>
            ) : (
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition"
              >
                &larr; Back to Shop Collection
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Top Navigation Row: Breadcrumbs & Continue Shopping */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-stone-900 transition">
              Shop
            </Link>
            <span>/</span>
            <span className="font-semibold text-stone-900">Your Cart</span>
          </nav>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-900 transition"
          >
            <span>&larr;</span>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900">
            Your Cart
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            {totalItemCount === 0
              ? "Your shopping bag is currently empty."
              : `Review your ${totalItemCount} ${
                  totalItemCount === 1 ? "item" : "items"
                } before moving to checkout.`}
          </p>
        </div>

        {/* Empty Cart Condition */}
        {validItems.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-10 sm:p-16 text-center shadow-xs max-w-2xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 mb-4">
              <ShoppingBagIcon className="w-8 h-8" />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-stone-900">
              Your shopping cart is empty
            </h2>
            <p className="mt-2 max-w-md mx-auto text-xs sm:text-sm text-stone-500 leading-relaxed">
              Explore our curated collection of everyday essentials, durable tech, and lifestyle items.
            </p>
            <div className="mt-8">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-8 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 cursor-pointer"
              >
                Discover Collection &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Main Cart Content: 2-Column Responsive Layout */
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            
            {/* LEFT COLUMN: Cart Items List (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Shipping Alert Bar */}
              <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-800">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ Free Standard Delivery Unlocked!
                      </span>
                    ) : (
                      <span>
                        Add{" "}
                        <strong className="text-stone-900 font-bold">
                          ₹{freeShippingDifference.toLocaleString("en-IN")}
                        </strong>{" "}
                        more to qualify for <span className="font-bold">Free Delivery</span>
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-stone-400">
                    Threshold: ₹{freeShippingThreshold}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full transition-all duration-500 ${
                      subtotal >= freeShippingThreshold ? "bg-emerald-500" : "bg-stone-800"
                    }`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="divide-y divide-stone-100 rounded-3xl border border-stone-200/90 bg-white shadow-xs overflow-hidden">
                {validItems.map((item) => {
                  const prod = item.product || {};
                  const itemQuantity = item.quantity || 1;
                  const itemPrice = Number(prod.price) || 0;
                  const itemTotal = itemPrice * itemQuantity;
                  const isUpdating = updatingId === prod._id;
                  const isOutOfStock = prod.stock !== undefined && prod.stock <= 0;
                  const isLowStock =
                    prod.stock !== undefined && prod.stock > 0 && prod.stock <= 3;
                  const maxStock = prod.stock !== undefined ? prod.stock : 999;

                  return (
                    <div
                      key={prod._id || item._id}
                      className="p-5 sm:p-6 transition hover:bg-stone-50/40"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        
                        {/* Left: Thumbnail & Details */}
                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                          {/* Image Box */}
                          <Link
                            to={`/products/${prod._id}`}
                            className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-50 p-2 border border-stone-200/70 flex items-center justify-center group"
                          >
                            <ProductImage
                              src={prod.image}
                              alt={prod.name || "Product"}
                              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center text-[10px] font-bold uppercase text-white p-1 text-center">
                                Sold Out
                              </div>
                            )}
                          </Link>

                          {/* Info Text */}
                          <div className="flex-1 min-w-0">
                            {prod.category && (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                {prod.category}
                              </span>
                            )}
                            <Link
                              to={`/products/${prod._id}`}
                              className="block mt-0.5"
                            >
                              <h3 className="text-sm sm:text-base font-medium text-stone-900 hover:text-stone-600 transition truncate">
                                {prod.name || "Curated Product"}
                              </h3>
                            </Link>
                            
                            <p className="mt-1 text-xs font-semibold text-stone-700">
                              ₹{itemPrice.toLocaleString("en-IN")}{" "}
                              <span className="text-[11px] font-normal text-stone-400">each</span>
                            </p>

                            {/* Stock Indicator Pills */}
                            {isOutOfStock ? (
                              <span className="mt-1.5 inline-block rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                                Currently Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="mt-1.5 inline-block rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                Only {prod.stock} units left
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Right: Quantity Stepper, Item Total & Remove CTA */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                          
                          {/* Quantity Selector Stepper */}
                          <div className="flex items-center rounded-full border border-stone-300 bg-white p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(prod._id, itemQuantity, -1, maxStock)
                              }
                              disabled={isUpdating || itemQuantity <= 1}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                              aria-label="Decrease quantity"
                            >
                              <span className="relative z-1">−</span>
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-stone-900">
                              {isUpdating ? "..." : itemQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(prod._id, itemQuantity, 1, maxStock)
                              }
                              disabled={isUpdating || itemQuantity >= maxStock}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                              aria-label="Increase quantity"
                            >
                              <span className="relative z-1">+</span>
                            </button>
                          </div>

                          {/* Line Item Total */}
                          <div className="text-right min-w-[90px]">
                            <span className="block text-xs text-stone-400 sm:hidden">Total</span>
                            <p className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(prod._id, prod.name)}
                            disabled={isUpdating}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition p-1.5 cursor-pointer disabled:opacity-30"
                            title="Remove product from cart"
                            aria-label={`Remove ${prod.name || "item"} from cart`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Back to Catalog Strip */}
              <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-1">
                <span>Prices inclusive of all applicable taxes.</span>
                <Link
                  to="/products"
                  className="font-semibold text-stone-800 hover:underline"
                >
                  &larr; Add more items
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary (lg:col-span-4) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
                
                <h2 className="font-editorial text-2xl font-normal tracking-tight text-stone-900 border-b border-stone-100 pb-4">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-3.5 text-xs text-stone-600">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span>Subtotal ({totalItemCount} items)</span>
                    <span className="font-bold text-stone-900 text-sm">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Coupon / Discount */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span className="flex items-center gap-1 font-medium">
                        Discount ({couponCode})
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="ml-1 text-[10px] text-stone-400 hover:text-rose-600 underline cursor-pointer"
                        >
                          remove
                        </button>
                      </span>
                      <span className="font-bold text-sm">
                        − ₹{discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <span>Shipping Estimate</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="font-bold text-emerald-700 uppercase tracking-wide">
                          Free
                        </span>
                      ) : (
                        <span className="font-bold text-stone-900">
                          ₹{shippingCost}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Coupon Input Box */}
                  <div className="border-t border-stone-100 pt-3">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon or Promo code"
                        disabled={isCouponApplied || isApplyingCoupon}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs text-stone-900 uppercase placeholder-stone-400 outline-none focus:border-stone-400 focus:bg-white transition"
                      />
                      {isCouponApplied ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                        >
                          Clear
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isApplyingCoupon || !couponCode.trim()}
                          className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed transition cursor-pointer min-h-[36px]"
                        >
                          <span className="relative z-1">{isApplyingCoupon ? "..." : "Apply"}</span>
                        </button>
                      )}
                    </form>
                    {couponMessage && (
                      <p
                        className={`mt-1.5 text-[11px] font-medium ${
                          isCouponApplied ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="border-t border-stone-200 pt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-stone-900 block">Total</span>
                      <span className="text-[10px] text-stone-400">Including all taxes</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-stone-900">
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 py-4 px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-98 cursor-pointer min-h-[48px]"
                >
                  <span className="relative z-1">Proceed to Checkout</span>
                  <span className="relative z-1">&rarr;</span>
                </button>

                {/* Secondary Continue Shopping link */}
                <div className="mt-3 text-center">
                  <Link
                    to="/products"
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust and Reassurance */}
                <div className="mt-6 border-t border-stone-100 pt-5 space-y-2.5 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <LockIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>256-bit encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Free shipping on all orders over ₹999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Dedicated customer support assistance</span>
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
