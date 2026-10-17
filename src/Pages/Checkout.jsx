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

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [couponApplying, setCouponApplying] = useState(false);

  // Address form fields with lazy initializers from stored profile
  const [name, setName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "{}").name || "";
    } catch {
      return "";
    }
  });
  const [phone, setPhone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "{}").phone || "";
    } catch {
      return "";
    }
  });
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    api
      .get("/cart")
      .then((response) => {
        const c = response.data?.cart ?? { items: [] };
        setCart(c);
        if (!c.items || c.items.length === 0) {
          notifyToast("Your cart is empty. Add products before checkout.", "warning");
          navigate("/products");
        }
      })
      .catch((error) => {
        setPageError(error.response?.data?.message || "Unable to load your cart.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const totalPrice = useMemo(() => {
    return (cart?.items ?? []).reduce(
      (total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cart]);

  const shippingCost = totalPrice >= 999 || totalPrice === 0 ? 0 : 99;
  const rawPayable = finalAmount !== null ? finalAmount : Math.max(totalPrice - discount, 0);
  const payableAmount = rawPayable + (totalPrice > 0 ? shippingCost : 0);

  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setPageError("Please fill out all delivery address fields.");
      return;
    }

    setAddressSaving(true);
    setPageError("");
    try {
      const response = await api.post("/addresses", {
        fullname: name.trim(),
        phone: phone.trim(),
        street: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });
      const saved = response.data?.address || {
        _id: "addr_temp",
        fullname: name,
        phone,
        street: address,
        city,
        state,
        pincode,
      };
      setSelectedAddress(saved);
      notifyToast("Delivery address confirmed!", "success");
    } catch (error) {
      console.error("Address save error:", error);
      // Fallback: save in state so customer is never blocked if address collection is client-verified
      setSelectedAddress({
        _id: "addr_local_" + Date.now(),
        fullname: name,
        phone,
        street: address,
        city,
        state,
        pincode,
      });
      notifyToast("Delivery address saved for this order", "success");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a valid coupon code.");
      return;
    }
    setCouponApplying(true);
    setCouponMessage("");
    try {
      const response = await api.post("/coupons/apply", {
        code: couponCode.trim(),
        orderAmount: totalPrice,
      });
      const d = Number(response.data?.discount || 0);
      setDiscount(d);
      setFinalAmount(Number(response.data?.finalAmount ?? totalPrice - d));
      setCouponMessage(response.data?.message || `Coupon applied: ₹${d} discount!`);
      notifyToast("Coupon applied successfully!", "success");
    } catch (error) {
      setDiscount(0);
      setFinalAmount(null);
      setCouponMessage(error.response?.data?.message || "Invalid or expired coupon code.");
      notifyToast("Invalid coupon code", "warning");
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setPageError("Please save your delivery address before placing your order.");
      return;
    }
    if (payableAmount <= 0 && totalPrice <= 0) {
      setPageError("Your cart is empty.");
      return;
    }

    setProcessing(true);
    setPageError("");

    try {
      // 1. Create order on backend
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
          throw new Error("Unable to load online payment gateway. Please select Cash on Delivery.");
        }

        const gateway = paymentResponse.data?.razorpay;
        if (!gateway?.orderId || !gateway?.keyId) {
          throw new Error("Online payment gateway is not configured on the server. Please choose Cash on Delivery.");
        }

        const razorpay = new window.Razorpay({
          key: gateway.keyId,
          amount: gateway.amount,
          currency: gateway.currency || "INR",
          name: "MyStore",
          description: `Payment for Order #${order._id.slice(-6)}`,
          order_id: gateway.orderId,
          prefill: {
            name: selectedAddress.fullname || name,
            contact: selectedAddress.phone || phone,
          },
          theme: { color: "#0f172a" },
          handler: async (result) => {
            try {
              await api.post("/payments/razorpay/verify", {
                orderId: order._id,
                ...result,
              });
              notifyCartUpdated(0);
              notifyToast("Order placed successfully! Thank you for shopping with us.", "success");
              navigate("/orders");
            } catch (verError) {
              setPageError(verError.response?.data?.message || "Payment verification failed.");
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
        notifyToast("Order placed successfully! Your items are on the way.", "success");
        navigate("/orders");
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setPageError(err.response?.data?.message || err.message || "Failed to place order.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12">
        <LoadingSpinner message="Preparing checkout..." />
      </main>
    );
  }

  const items = cart?.items || [];

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Secure Checkout
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Complete your address and payment details below.
            </p>
          </div>

          <Link
            to="/cart"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            &larr; Return to Cart
          </Link>
        </div>

        {pageError && (
          <div className="mb-6">
            <ErrorState title="Checkout Issue" message={pageError} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column (7 cols): Address Form & Payment Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Delivery Address Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Delivery Address
                  </h2>
                </div>
                {selectedAddress && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ✓ Saved
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Receiver's name"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address & Landmark *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat number, building name, street, locality"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6 digits"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {addressSaving ? "Saving..." : selectedAddress ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>

            {/* Step 2: Payment Method Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  2
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Select Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash On Delivery */}
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                    paymentMethod === "COD"
                      ? "border-slate-900 bg-slate-50/70 ring-1 ring-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Cash on Delivery (COD) / Pay on Arrival
                    </span>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Pay easily in cash or UPI when your parcel is delivered at your doorstep.
                    </p>
                  </div>
                </label>

                {/* Razorpay Online */}
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-slate-900 bg-slate-50/70 ring-1 ring-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Online Payment (UPI, Cards & Net Banking)
                    </span>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Fast and encrypted checkout processed via Razorpay.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Order Items & Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* Items Overview Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Items in Order ({items.length})
              </h2>

              <div className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div
                    key={item.product?._id || item._id}
                    className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-b-0"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50 p-1 border border-slate-100">
                      <ProductImage
                        src={item.product?.image}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} &times; ₹{item.product?.price}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{((Number(item.product?.price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="mt-5 border-t border-slate-100 pt-5">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase text-slate-800 outline-none focus:border-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={couponApplying}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {couponApplying ? "Applying..." : "Apply"}
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`mt-2 text-[11px] font-semibold ${
                      discount > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="mt-5 border-t border-slate-100 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Payable Total</span>
                  <span>₹{payableAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddress}
                className="mt-6 w-full rounded-xl bg-slate-900 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-98 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer"
              >
                {processing
                  ? "Processing Order..."
                  : !selectedAddress
                  ? "Save Address to Continue"
                  : paymentMethod === "COD"
                  ? `Place Order (Cash on Delivery) • ₹${payableAmount.toLocaleString("en-IN")}`
                  : `Pay ₹${payableAmount.toLocaleString("en-IN")} Securely`}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                By placing this order you agree to MyStore terms and delivery policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
