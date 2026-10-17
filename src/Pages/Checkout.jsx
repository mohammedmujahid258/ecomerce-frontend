import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import { notifyCartUpdated, notifyToast } from "../utils/cartWishlistEvents";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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

function CheckCircleIcon({ className = "w-6 h-6" }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [couponApplying, setCouponApplying] = useState(false);

  // Confirmed Order state (Order Confirmation screen)
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Address state & list
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Address form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState(() => {
    return sessionStorage.getItem("cart_coupon_code") || "";
  });
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");

  // Payment Method: COD (default) or RAZORPAY
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Fetch Cart, Profile & Addresses on mount
  useEffect(() => {
    let isMounted = true;

    const initCheckout = async () => {
      try {
        const [cartRes, profileRes] = await Promise.all([
          api.get("/cart"),
          api.get("/users/profile").catch(() => ({ data: { user: null } })),
        ]);

        if (!isMounted) return;

        const c = cartRes.data?.cart ?? { items: [] };
        setCart(c);

        if (!c.items || c.items.length === 0) {
          notifyToast("Your cart is empty. Add products before checkout.", "warning");
          navigate("/products");
          return;
        }

        const user =
          profileRes.data?.user || profileRes.data?.data?.user || profileRes.data;
        if (user) {
          setCurrentUser(user);
          if (user.name) setName(user.name);
          if (user.phone) setPhone(user.phone);
        }

        // Load Addresses
        let loadedAddresses = [];
        try {
          const addrRes = await api.get("/addresses");
          const list = addrRes.data?.addresses || addrRes.data?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            loadedAddresses = list;
          }
        } catch {
          // If backend doesn't support GET /addresses, fallback to storage
        }

        if (loadedAddresses.length === 0) {
          const userKey = user?._id ? `saved_addresses_${user._id}` : "saved_addresses";
          try {
            const local = JSON.parse(localStorage.getItem(userKey) || "[]");
            if (Array.isArray(local) && local.length > 0) {
              loadedAddresses = local;
            }
          } catch {
            // ignore JSON error
          }
        }

        if (loadedAddresses.length > 0) {
          setSavedAddresses(loadedAddresses);
          setSelectedAddressId(loadedAddresses[0]._id);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }

        // Check if a coupon was pre-applied in the cart
        const prefilledCoupon = sessionStorage.getItem("cart_coupon_code");
        if (prefilledCoupon) {
          const sub = (c.items || []).reduce(
            (tot, it) =>
              tot + (Number(it.product?.price) || 0) * (it.quantity || 1),
            0
          );
          try {
            const coupRes = await api.post("/coupons/apply", {
              code: prefilledCoupon.trim(),
              orderAmount: sub,
            });
            const d = Number(coupRes.data?.discount || 0);
            setDiscount(d);
            setFinalAmount(Number(coupRes.data?.finalAmount ?? sub - d));
            setCouponMessage(coupRes.data?.message || `Coupon applied: ₹${d} discount!`);
          } catch {
            // ignore coupon prefill error
          }
        }
      } catch (err) {
        console.error("Checkout initialization error:", err);
        if (isMounted) {
          setPageError(
            err.response?.data?.message ||
              "Unable to load your cart. Please check your connection."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initCheckout();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const items = useMemo(() => {
    return (cart?.items || []).filter((item) => item && item.product);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.product?.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [items]);

  const shippingCost = totalPrice >= 999 || totalPrice === 0 ? 0 : 99;
  const rawPayable =
    finalAmount !== null ? finalAmount : Math.max(totalPrice - discount, 0);
  const payableAmount = rawPayable + (totalPrice > 0 ? shippingCost : 0);

  // Active Selected Address
  const activeAddress = useMemo(() => {
    return savedAddresses.find((a) => a._id === selectedAddressId) || null;
  }, [savedAddresses, selectedAddressId]);

  // Stock check
  const stockErrors = useMemo(() => {
    const list = [];
    items.forEach((item) => {
      const prod = item.product;
      if (!prod) return;
      if (prod.stock !== undefined && prod.stock <= 0) {
        list.push(`"${prod.name}" is currently sold out.`);
      } else if (prod.stock !== undefined && item.quantity > prod.stock) {
        list.push(
          `"${prod.name}" has only ${prod.stock} units available (cart has ${item.quantity}).`
        );
      }
    });
    return list;
  }, [items]);

  // Validate Address
  const validateAddress = () => {
    if (!name.trim() || name.trim().length < 2) {
      return "Please enter a valid full name.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return "Please enter a valid 10-digit mobile phone number.";
    }
    if (!address.trim() || address.trim().length < 5) {
      return "Please enter a complete street address and landmark.";
    }
    if (!city.trim() || city.trim().length < 2) {
      return "Please enter your city.";
    }
    if (!state.trim() || state.trim().length < 2) {
      return "Please enter your state.";
    }
    const cleanPin = pincode.replace(/\D/g, "");
    if (cleanPin.length < 6) {
      return "Please enter a valid 6-digit PIN code.";
    }
    return null;
  };

  // Save / Add Address
  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
    const validationError = validateAddress();
    if (validationError) {
      setPageError(validationError);
      return;
    }

    setAddressSaving(true);
    setPageError("");

    const newAddressObj = {
      fullname: name.trim(),
      phone: phone.trim(),
      street: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    try {
      const response = await api.post("/addresses", newAddressObj);
      const saved = response.data?.address || {
        _id: "addr_" + Date.now(),
        ...newAddressObj,
      };

      const updated = [
        saved,
        ...savedAddresses.filter((a) => a._id !== saved._id),
      ];
      setSavedAddresses(updated);
      setSelectedAddressId(saved._id);
      setIsAddingNewAddress(false);

      const userKey = currentUser?._id
        ? `saved_addresses_${currentUser._id}`
        : "saved_addresses";
      localStorage.setItem(userKey, JSON.stringify(updated));
      notifyToast("Delivery address confirmed!", "success");
    } catch (err) {
      console.error("Address save error:", err);
      // Graceful fallback: persist locally for this user
      const fallbackSaved = {
        _id: "addr_local_" + Date.now(),
        ...newAddressObj,
      };
      const updated = [
        fallbackSaved,
        ...savedAddresses.filter((a) => a._id !== fallbackSaved._id),
      ];
      setSavedAddresses(updated);
      setSelectedAddressId(fallbackSaved._id);
      setIsAddingNewAddress(false);

      const userKey = currentUser?._id
        ? `saved_addresses_${currentUser._id}`
        : "saved_addresses";
      localStorage.setItem(userKey, JSON.stringify(updated));
      notifyToast("Delivery address confirmed for this order", "success");
    } finally {
      setAddressSaving(false);
    }
  };

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim();
    if (!cleanCode) {
      setCouponMessage("Please enter a valid coupon code.");
      return;
    }

    setCouponApplying(true);
    setCouponMessage("");
    try {
      const response = await api.post("/coupons/apply", {
        code: cleanCode,
        orderAmount: totalPrice,
      });
      const d = Number(response.data?.discount || 0);
      setDiscount(d);
      setFinalAmount(Number(response.data?.finalAmount ?? totalPrice - d));
      setCouponMessage(
        response.data?.message || `Coupon applied: ₹${d.toLocaleString("en-IN")} discount!`
      );
      sessionStorage.setItem("cart_coupon_code", cleanCode);
      notifyToast("Coupon applied successfully!", "success");
    } catch (error) {
      setDiscount(0);
      setFinalAmount(null);
      setCouponMessage(
        error.response?.data?.message || "Invalid or expired coupon code."
      );
      notifyToast("Invalid coupon code", "warning");
    } finally {
      setCouponApplying(false);
    }
  };

  // Place Order
  const handlePlaceOrder = async () => {
    if (isAddingNewAddress || !activeAddress) {
      setPageError("Please save or select a delivery address before placing your order.");
      return;
    }

    if (stockErrors.length > 0) {
      setPageError("Please return to your cart and adjust out-of-stock items before checkout.");
      return;
    }

    if (payableAmount <= 0 && totalPrice <= 0) {
      setPageError("Your cart is empty.");
      return;
    }

    setProcessing(true);
    setPageError("");

    try {
      // 1. Create order on backend (Backend is authoritative for pricing & stock)
      const orderResponse = await api.post("/orders/create", {
        couponCode: couponCode.trim() || undefined,
      });

      const order = orderResponse.data?.order;
      if (!order?._id) {
        throw new Error("Order creation failed on server.");
      }

      // 2. Create payment record
      const paymentResponse = await api.post("/payments", {
        orderId: order._id,
        paymentMethod,
      });

      const payment = paymentResponse.data?.payment;

      if (paymentMethod === "RAZORPAY") {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error(
            "Unable to load online payment gateway. Please choose Cash on Delivery."
          );
        }

        const gateway = paymentResponse.data?.razorpay;
        if (!gateway?.orderId || !gateway?.keyId) {
          throw new Error(
            "Online payment gateway is not configured on the server. Please choose Cash on Delivery."
          );
        }

        const razorpay = new window.Razorpay({
          key: gateway.keyId,
          amount: gateway.amount,
          currency: gateway.currency || "INR",
          name: "MyStore",
          description: `Payment for Order #${order._id.slice(-6)}`,
          order_id: gateway.orderId,
          prefill: {
            name: activeAddress.fullname || name,
            contact: activeAddress.phone || phone,
          },
          theme: { color: "#1c1917" },
          handler: async (result) => {
            try {
              await api.post("/payments/razorpay/verify", {
                orderId: order._id,
                ...result,
              });
              notifyCartUpdated(0);
              sessionStorage.removeItem("cart_coupon_code");
              setConfirmedOrder(order);
              notifyToast("Order placed successfully! Thank you for your purchase.", "success");
            } catch (verError) {
              setPageError(
                verError.response?.data?.message || "Payment verification failed."
              );
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        });

        razorpay.open();
      } else {
        // Cash on delivery / Supported direct checkout
        if (payment?._id) {
          try {
            await api.post(`/payments/${payment._id}/mock-success`);
          } catch {
            // COD does not require instant mock payment
          }
        }
        notifyCartUpdated(0);
        sessionStorage.removeItem("cart_coupon_code");
        setConfirmedOrder(order);
        notifyToast("Order placed successfully! Your items are confirmed.", "success");
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setPageError(
        err.response?.data?.message || err.message || "Failed to place order."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Preparing secure checkout..." />
      </main>
    );
  }

  // =========================================================================
  // ORDER CONFIRMATION SCREEN (Shown immediately upon backend success)
  // =========================================================================
  if (confirmedOrder) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-12 shadow-xs text-center">
            
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
              <CheckCircleIcon className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Order Confirmed & Placed
            </span>

            <h1 className="mt-4 font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900">
              Thank you for your order!
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
              We have received your order and our fulfillment team has started preparing your package for express dispatch.
            </p>

            {/* Reference Badge */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-stone-50 border border-stone-200/80 px-5 py-3 text-xs">
              <span className="text-stone-400">Order Reference:</span>
              <span className="font-mono font-bold text-stone-900 tracking-wider">
                #{confirmedOrder._id}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600 font-medium">
                {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment Verified"}
              </span>
            </div>

            {/* Order Details Breakdown */}
            <div className="mt-8 text-left rounded-2xl border border-stone-200/80 bg-stone-50/50 p-6 space-y-4">
              
              {/* Delivery Address Summary */}
              {activeAddress && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                    Shipping Destination
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-stone-800">
                    {activeAddress.fullname} ({activeAddress.phone})
                  </p>
                  <p className="text-xs text-stone-600">
                    {activeAddress.street}, {activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}
                  </p>
                </div>
              )}

              {/* Items in this order */}
              <div className="border-t border-stone-200/80 pt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-3">
                  Items Purchased ({items.length})
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product?._id || item._id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white p-1 border border-stone-200/80">
                          <ProductImage
                            src={item.product?.image}
                            alt={item.product?.name || "Product"}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 truncate max-w-xs">
                            {item.product?.name}
                          </p>
                          <span className="text-[11px] text-stone-400">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">
                        ₹{((Number(item.product?.price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Paid / Payable */}
              <div className="border-t border-stone-200/80 pt-4 flex items-center justify-between text-sm">
                <span className="font-bold text-stone-800">Total Confirmed</span>
                <span className="text-lg font-bold text-stone-900">
                  ₹{payableAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/orders/${confirmedOrder._id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-stone-900 px-8 py-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95"
              >
                View Order Receipt & Tracking &rarr;
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-7 py-3.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition"
              >
                Continue Shopping
              </Link>
            </div>

          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // MAIN CHECKOUT FORM
  // =========================================================================
  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Top Breadcrumb & Return to Cart */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-stone-900 transition">
              Cart
            </Link>
            <span>/</span>
            <span className="font-semibold text-stone-900">Secure Checkout</span>
          </nav>

          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-900 transition"
          >
            <span>&larr;</span>
            <span>Return to Shopping Bag</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900">
            Checkout
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            Please confirm your delivery address and choose a payment method.
          </p>
        </div>

        {/* Global Page Error Banner */}
        {pageError && (
          <div className="mb-8">
            <ErrorState title="Checkout Notice" message={pageError} />
          </div>
        )}

        {/* Stock Issue Banner */}
        {stockErrors.length > 0 && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800">
            <p className="font-bold mb-1">Inventory Alert:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {stockErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
            <div className="mt-3">
              <Link
                to="/cart"
                className="font-bold text-rose-900 underline hover:no-underline"
              >
                &larr; Return to Cart to Update Quantities
              </Link>
            </div>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* =========================================================================
              LEFT COLUMN: DELIVERY ADDRESS & PAYMENT METHOD (lg:col-span-7)
              ========================================================================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Delivery Address */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="font-editorial text-xl font-normal text-stone-900">
                    Delivery Address
                  </h2>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress((prev) => !prev)}
                    className="text-xs font-semibold text-stone-800 hover:underline cursor-pointer"
                  >
                    {isAddingNewAddress ? "Select Existing Address" : "+ Add New Address"}
                  </button>
                )}
              </div>

              {/* Case A: Choose from Saved Addresses */}
              {!isAddingNewAddress && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <label
                        key={addr._id}
                        className={`block cursor-pointer rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-stone-900 bg-stone-50/80 ring-1 ring-stone-900"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={addr._id}
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="mt-1 h-4 w-4 text-stone-900 focus:ring-stone-900"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-stone-900">
                                {addr.fullname}
                              </span>
                              {isSelected && (
                                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Deliver to this address
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-stone-600">
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="mt-0.5 text-[11px] text-stone-400">
                              Phone: {addr.phone}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Case B: Add / Enter New Address Form */}
              {(isAddingNewAddress || savedAddresses.length === 0) && (
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Receiver's name"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Street Address & Landmark *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat number, building name, street, locality"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="6 digits"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
                    >
                      <span className="relative z-1">{addressSaving ? "Saving..." : "Save Delivery Address"}</span>
                    </button>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="text-xs font-semibold text-stone-600 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-6">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                  2
                </span>
                <h2 className="font-editorial text-xl font-normal text-stone-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash On Delivery (COD) */}
                <label
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                    paymentMethod === "COD"
                      ? "border-stone-900 bg-stone-50/80 ring-1 ring-stone-900"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 h-4 w-4 text-stone-900 focus:ring-stone-900"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-stone-900">
                      Cash on Delivery (COD) / Pay on Arrival
                    </span>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Pay via cash or UPI to the courier upon delivery at your door.
                    </p>
                  </div>
                </label>

                {/* Razorpay Online */}
                <label
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-stone-900 bg-stone-50/80 ring-1 ring-stone-900"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 h-4 w-4 text-stone-900 focus:ring-stone-900"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-stone-900">
                      Online Payment (UPI, Cards & Net Banking)
                    </span>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Encrypted checkout processed through Razorpay. (Requires backend gateway keys)
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: ORDER OVERVIEW & SUMMARY (lg:col-span-5)
              ========================================================================= */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
              
              <h2 className="font-editorial text-2xl font-normal tracking-tight text-stone-900 border-b border-stone-100 pb-4">
                Order Review ({items.length} {items.length === 1 ? "item" : "items"})
              </h2>

              {/* Items List */}
              <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-stone-100">
                {items.map((item) => {
                  const prod = item.product || {};
                  const isOutOfStock = prod.stock !== undefined && prod.stock <= 0;
                  return (
                    <div
                      key={prod._id || item._id}
                      className="flex items-center gap-3 pt-3 first:pt-0"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-50 p-1 border border-stone-200/70">
                        <ProductImage
                          src={prod.image}
                          alt={prod.name || "Product"}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          Qty: {item.quantity} &times; ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                        </p>
                        {isOutOfStock && (
                          <span className="text-[10px] font-bold text-rose-600">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-900">
                        ₹{((Number(prod.price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code Section */}
              <div className="mt-6 border-t border-stone-100 pt-5">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon or Promo code"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs uppercase text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={couponApplying || !couponCode.trim()}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed transition cursor-pointer min-h-[36px]"
                  >
                    <span className="relative z-1">{couponApplying ? "..." : "Apply"}</span>
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`mt-1.5 text-[11px] font-medium ${
                      discount > 0 ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="mt-5 border-t border-stone-100 pt-4 space-y-3 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-stone-900">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>− ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="font-bold text-emerald-700 uppercase">
                        Free
                      </span>
                    ) : (
                      <span className="font-bold text-stone-900">
                        ₹{shippingCost}
                      </span>
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">Total Payable</span>
                    <span className="text-[10px] text-stone-400">All taxes included</span>
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-stone-900">
                    ₹{payableAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={processing || isAddingNewAddress || !activeAddress || stockErrors.length > 0}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-98 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-600 cursor-pointer text-center leading-snug min-h-[48px]"
              >
                {processing ? (
                  <span className="relative z-1">Processing Order...</span>
                ) : stockErrors.length > 0 ? (
                  <span className="relative z-1">Items Out of Stock</span>
                ) : isAddingNewAddress || !activeAddress ? (
                  <span className="relative z-1">Save Delivery Address to Continue</span>
                ) : paymentMethod === "COD" ? (
                  <span className="relative z-1">Place Order (Cash on Delivery) • ₹{payableAmount.toLocaleString("en-IN")}</span>
                ) : (
                  <span className="relative z-1">Pay ₹{payableAmount.toLocaleString("en-IN")} Securely</span>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 border-t border-stone-100 pt-5 space-y-2 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <LockIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>256-Bit SSL Encrypted Order Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Direct order verification with server backend</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
