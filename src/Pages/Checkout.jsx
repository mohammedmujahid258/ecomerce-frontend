import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

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

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [pageError, setPageError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [couponApplying, setCouponApplying] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  useEffect(() => {
    api
      .get("/cart")
      .then((response) => setCart(response.data?.cart ?? { items: [] }))
      .catch((error) => setPageError(error.response?.data?.message || "Unable to load your cart."));

    // Pre-fill existing address if available
    api
      .get("/addresses")
      .then((response) => {
        const addresses = response.data?.address || [];
        if (addresses.length > 0) {
          const defaultAddr = addresses[0];
          setSelectedAddress(defaultAddr);
          setName(defaultAddr.fullname || "");
          setPhone(defaultAddr.phone || "");
          setAddress(defaultAddr.street || "");
          setCity(defaultAddr.city || "");
          setState(defaultAddr.state || "");
          setPincode(defaultAddr.pincode || "");
        }
      })
      .catch(() => {
        // Silently ignore if no saved addresses yet
      });
  }, []);

  const totalPrice = useMemo(
    () =>
      (cart?.items ?? []).reduce(
        (total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );
  const payableAmount = finalAmount ?? Math.max(totalPrice - discount, 0);

  const handleSaveAddress = async () => {
    if (![name, phone, address, city, state, pincode].every(Boolean)) {
      setPageError("Please complete every delivery address field.");
      return;
    }
    setAddressSaving(true);
    setPageError("");
    try {
      const response = await api.post("/addresses", {
        fullname: name,
        phone,
        street: address,
        city,
        state,
        pincode,
      });
      setSelectedAddress(response.data?.address);
    } catch (error) {
      setPageError(error.response?.data?.message || "Unable to save the address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    setCouponApplying(true);
    try {
      const response = await api.post("/coupons/apply", { code: couponCode.trim(), orderAmount: totalPrice });
      setDiscount(Number(response.data.discount || 0));
      setFinalAmount(Number(response.data.finalAmount ?? totalPrice));
      setCouponMessage(response.data.message || "Coupon applied.");
    } catch (error) {
      setDiscount(0);
      setFinalAmount(null);
      setCouponMessage(error.response?.data?.message || "Unable to apply the coupon.");
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress?._id) {
      setPageError("Please save your delivery address before paying.");
      return;
    }
    if (payableAmount <= 0) {
      setPageError("The payable amount must be greater than zero.");
      return;
    }
    setProcessing(true);
    setPageError("");

    try {
      let order = createdOrder;

      // 1. Create order only if not already created in this checkout session
      if (!order?._id) {
        try {
          const orderResponse = await api.post("/orders/create", {
            couponCode: couponCode.trim() || undefined,
          });
          order = orderResponse.data?.order;
          if (order?._id) {
            setCreatedOrder(order);
          }
        } catch (orderErr) {
          const errMsg = orderErr.response?.data?.message || "";
          // If cart is empty, order may have been created on the previous attempt
          if (errMsg.toLowerCase().includes("cart is empty")) {
            const myOrdersRes = await api.get("/orders");
            const myOrders = myOrdersRes.data?.orders || [];
            if (myOrders.length > 0) {
              order = myOrders[0];
              setCreatedOrder(order);
            } else {
              throw new Error("Your cart is empty. Please add items to cart first.", { cause: orderErr });
            }
          } else {
            throw orderErr;
          }
        }
      }

      if (!order?._id) {
        throw new Error("The order could not be created.");
      }

      // 2. Initiate Payment
      let paymentResponse;
      try {
        paymentResponse = await api.post("/payments", {
          orderId: order._id,
          paymentMethod,
        });
      } catch (payErr) {
        const payErrMsg = payErr.response?.data?.message || payErr.message || "";
        console.warn("Payment initiation issue:", payErrMsg);

        // If Razorpay gateway failed on backend (500 or 503 or 400), explain clearly
        if (paymentMethod === "RAZORPAY") {
          throw new Error(
            payErrMsg.includes("Razorpay") || payErrMsg.includes("configured")
              ? payErrMsg
              : "Online payment gateway is unavailable. Please select Cash on Delivery (COD) to place your order.",
            { cause: payErr }
          );
        }
        throw payErr;
      }

      const payment = paymentResponse.data?.payment;
      if (!payment?._id) throw new Error("Payment record could not be created.");

      // 3. Complete payment according to selected method
      if (paymentMethod === "RAZORPAY") {
        const gateway = paymentResponse.data?.razorpay;
        if (!gateway?.orderId || !gateway?.keyId) {
          throw new Error("Online payment is not configured on the server. Please select Cash on Delivery.");
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay Checkout failed to load. Please check your internet connection.");
        }

        const razorpay = new window.Razorpay({
          key: gateway.keyId,
          amount: gateway.amount,
          currency: gateway.currency || "INR",
          name: "MyStore",
          description: `Payment for order #${order._id.slice(-6)}`,
          order_id: gateway.orderId,
          prefill: { name: name || "Customer", contact: phone || "9999999999" },
          theme: { color: "#202016" },
          handler: async (result) => {
            try {
              await api.post("/payments/razorpay/verify", { orderId: order._id, ...result });
              navigate("/orders");
            } catch (verifyErr) {
              setPageError(verifyErr.response?.data?.message || "Payment verification failed.");
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: () => setProcessing(false),
          },
        });

        razorpay.on("payment.failed", (response) => {
          setPageError(response.error?.description || "Payment failed. Please try again or use Cash on Delivery.");
          setProcessing(false);
        });

        razorpay.open();
      } else {
        // Cash on Delivery / Mock Payment
        await api.post(`/payments/${payment._id}/mock-success`);
        navigate("/orders");
      }
    } catch (error) {
      setPageError(error.response?.data?.message || error.message || "Unable to complete order.");
      setProcessing(false);
    }
  };

  if (!cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#fffdf7] text-sm font-bold text-[#202016]">
        Loading checkout...
      </div>
    );
  }

  if (cart.items.length === 0 && !createdOrder) {
    return (
      <div className="min-h-[60vh] bg-[#fffdf7] p-8 text-center">
        <h1 className="text-2xl font-black text-[#202016]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-600">Add products to your cart before proceeding to checkout.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/products"
            className="rounded-full bg-[#202016] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#a48500]"
          >
            Browse Products
          </Link>
          <Link
            to="/orders"
            className="rounded-full border border-[#202016] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#202016] transition hover:bg-[#fff7d6]"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf7] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-[#202016]">Checkout</h1>
          <Link to="/cart" className="text-xs font-bold text-[#a48500] hover:underline">
            ← Return to Cart
          </Link>
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm">
            ⚠️ {pageError}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          {/* Left Column: Address and Payment Method */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#202016]">1. Delivery Address</h2>
                {selectedAddress && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    ✓ Address Saved
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#a48500] focus:bg-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#a48500] focus:bg-white"
                />
                <textarea
                  placeholder="Street Address, House/Flat No."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#a48500] focus:bg-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#a48500] focus:bg-white"
                  />
                  <input
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#a48500] focus:bg-white"
                  />
                  <input
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-[#a48500] focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={addressSaving}
                className="mt-3.5 w-full rounded-xl bg-[#202016] py-2.5 text-xs font-bold text-white transition hover:bg-[#a48500] disabled:opacity-50 cursor-pointer"
              >
                {addressSaving ? "Saving Address..." : selectedAddress ? "Update / Confirm Address" : "Save Address"}
              </button>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#202016]">2. Payment Method</h2>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-[#202016] bg-[#fff7d6]/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#202016]"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#202016]">Pay Securely Online (Razorpay)</p>
                    <p className="text-[11px] text-slate-500">UPI, Google Pay, PhonePe, Cards, Net Banking</p>
                  </div>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                    paymentMethod === "COD"
                      ? "border-[#202016] bg-[#fff7d6]/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#202016]"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#202016]">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-500">Pay cash or scan QR when order arrives at doorstep</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#202016]">Order Summary</h2>

              {/* Items List */}
              <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                {(cart.items || []).map((item) => (
                  <div key={item.product?._id || item._id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                    <div className="pr-2">
                      <p className="font-bold text-[#202016] line-clamp-1">{item.product?.name || "Product"}</p>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#202016]">₹{(item.product?.price || 0) * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs outline-none focus:border-[#a48500]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponApplying}
                    className="rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#202016] disabled:opacity-50 cursor-pointer"
                  >
                    {couponApplying ? "..." : "Apply"}
                  </button>
                </div>
                {couponMessage && (
                  <p className="mt-1.5 text-[11px] font-semibold text-emerald-600">{couponMessage}</p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Discount</span>
                    <span>- ₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-[#202016]">
                  <span>Total Payable</span>
                  <span className="text-base text-[#a48500]">₹{payableAmount}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddress}
                className="mt-5 w-full rounded-xl bg-[#202016] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#a48500] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {processing
                  ? "Processing..."
                  : !selectedAddress
                  ? "Save Address First"
                  : paymentMethod === "COD"
                  ? `Place Order (COD) • ₹${payableAmount}`
                  : `Pay ₹${payableAmount} Online`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
