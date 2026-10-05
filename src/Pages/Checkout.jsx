import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    api.get("/cart")
      .then((response) => setCart(response.data?.cart ?? { items: [] }))
      .catch((error) => setPageError(error.response?.data?.message || "Unable to load your cart."));
  }, []);

  const totalPrice = useMemo(() => (cart?.items ?? []).reduce(
    (total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 0), 0
  ), [cart]);
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
        fullname: name, phone, street: address, city, state, pincode,
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
      setPageError("Save your delivery address before paying.");
      return;
    }
    if (payableAmount <= 0) {
      setPageError("The payable amount must be greater than zero.");
      return;
    }
    setProcessing(true);
    setPageError("");
    try {
      const orderResponse = await api.post("/orders/create", {
        couponCode: couponCode.trim() || undefined,
      });
      const order = orderResponse.data?.order;
      if (!order?._id) throw new Error("The order could not be created.");

      const paymentResponse = await api.post("/payments", {
        orderId: order._id,
        paymentMethod,
      });
      const payment = paymentResponse.data?.payment;
      if (!payment?._id) throw new Error("The payment could not be created.");

      if (paymentMethod === "RAZORPAY") {
        if (!(await loadRazorpayScript())) throw new Error("Razorpay Checkout could not be loaded.");
        const gateway = paymentResponse.data?.razorpay;
        if (!gateway?.orderId || !gateway?.keyId || !gateway?.amount) throw new Error("Online payment is not configured correctly.");
        const razorpay = new window.Razorpay({
          key: gateway.keyId,
          amount: gateway.amount,
          currency: gateway.currency,
          name: "E-commerce Store",
          description: `Payment for order ${order._id}`,
          order_id: gateway.orderId,
          prefill: { name, contact: phone },
          theme: { color: "#2563eb" },
          handler: async (result) => {
            try {
              await api.post("/payments/razorpay/verify", { orderId: order._id, ...result });
              navigate("/orders");
            } catch (error) {
              setPageError(error.response?.data?.message || "Payment verification failed.");
              setProcessing(false);
            }
          },
          modal: { ondismiss: () => setProcessing(false) },
        });
        razorpay.on("payment.failed", (response) => {
          setPageError(response.error?.description || "Payment failed. Please try again.");
          setProcessing(false);
        });
        razorpay.open();
      } else {
        await api.post(`/payments/${payment._id}/mock-success`);
        navigate("/orders");
      }
    } catch (error) {
      setPageError(error.response?.data?.message || error.message || "Unable to start payment.");
      setProcessing(false);
    }
  };

  if (!cart) return <div className="flex min-h-screen items-center justify-center bg-gray-100">Loading checkout...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Checkout</h1>
        {pageError && <p className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">{pageError}</p>}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-2xl font-bold">Your Items</h2>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between border-b pb-4">
                <div><h3 className="text-lg font-semibold">{item.product.name}</h3><p className="text-gray-500">Quantity: {item.quantity}</p></div>
                <p className="font-semibold">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between border-t pt-5"><h2 className="text-xl font-bold">Subtotal</h2><p className="text-xl font-bold text-green-600">₹{totalPrice}</p></div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-2xl font-bold">Delivery Address</h2>
          <div className="space-y-4">
            <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border px-4 py-3" />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border px-4 py-3" />
            <textarea placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border px-4 py-3" rows="3" />
            <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border px-4 py-3" />
            <input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-lg border px-4 py-3" />
            <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full rounded-lg border px-4 py-3" />
          </div>
          <button type="button" onClick={handleSaveAddress} disabled={addressSaving} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{addressSaving ? "Saving..." : selectedAddress ? "Address Saved" : "Save Address"}</button>

          <div className="mt-6 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Apply Coupon</h2>
            <div className="flex gap-3"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="flex-1 rounded border px-3 py-2" /><button type="button" onClick={handleApplyCoupon} disabled={couponApplying} className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50">{couponApplying ? "Applying..." : "Apply"}</button></div>
            {couponMessage && <p className="mt-2 text-sm text-green-600">{couponMessage}</p>}
          </div>

          <div className="mt-6 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Payment method</h2>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
              <input type="radio" name="paymentMethod" value="RAZORPAY" checked={paymentMethod === "RAZORPAY"} onChange={(event) => setPaymentMethod(event.target.value)} />
              <span><strong>Pay securely online</strong><small className="block text-gray-500">UPI, cards and net banking via Razorpay</small></span>
            </label>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border p-3">
              <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={(event) => setPaymentMethod(event.target.value)} />
              <span><strong>Cash on delivery</strong><small className="block text-gray-500">Pay when your order arrives</small></span>
            </label>
          </div>

          <div className="mt-6 rounded-lg border p-6"><h2 className="mb-4 text-xl font-bold">Order Summary</h2><div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice}</span></div><div className="mt-2 flex justify-between"><span>Discount</span><span>- ₹{discount}</span></div><hr className="my-3" /><div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{payableAmount}</span></div></div>
          <button type="button" onClick={handlePlaceOrder} disabled={processing || !selectedAddress} className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{processing ? "Processing payment..." : paymentMethod === "COD" ? "Place order" : `Pay ₹${payableAmount}`}</button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
