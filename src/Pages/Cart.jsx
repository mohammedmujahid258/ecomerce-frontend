import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Cart response:", response.data);
        setCart(response.data?.cart ?? { items: [] });
      } catch (err) {
        console.log("Error fetching Cart:", err);

        if (err.response?.status === 401) {
          setError("Please log in to view your cart.");
        } else if (err.code === "ERR_NETWORK") {
          setError(
            "Unable to connect to the server. Please start the backend and try again."
          );
        } else {
          setError("Unable to load your cart. Please try again.");
        }
      }
    };

    fetchCart();
  }, []);

  // Change quantity
  const changeQuantity = async (productId, direction, currentQuantity) => {
    try {
      const newQuantity =
        direction === "increase" ? currentQuantity + 1 : currentQuantity - 1;

      if (newQuantity < 1) {
        return;
      }

      const response = await api.put("/cart", {
        productId,
        quantity: newQuantity,
      });

      setCart(response.data?.cart);
    } catch (err) {
      console.log("Error updating quantity:", err);
    }
  };

  // Remove product
  const removeItem = async (productId) => {
    try {
      const response = await api.delete("/cart", {
        data: {
          productId,
        },
      });

      setCart(response.data?.cart);
    } catch (err) {
      console.log("Error removing item:", err);
    }
  };

  // Loading
  if (!cart) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_24px_70px_rgb(32_32_22/18%)]">
          <span className="animate-pulse text-3xl font-black text-[#a48500]">✦</span>
          <p className="mt-3 text-sm font-bold text-[#202016]">Loading cart...</p>
        </div>
      </main>
    );
  }

  // Calculate total price
  const totalPrice = (cart.items || []).reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  // Error
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_24px_70px_rgb(32_32_22/18%)]">
          <span className="text-3xl font-black text-rose-500">⚠️</span>
          <p className="mt-3 rounded-md bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl bg-[#202016] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-4 sm:p-6 shadow-[0_24px_70px_rgb(32_32_22/18%)]">
        {/* Golden Mesh Header Banner - Matching Login/Wishlist Style */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-6 sm:p-8 text-[#202016]">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#a48500]/25 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#202016]">✦</span>
                <p className="text-xs font-bold uppercase tracking-wider text-[#514810]">
                  Your Shopping Bag
                </p>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#202016]">
                My Cart 🛒
              </h1>
              <p className="mt-1 text-xs text-[#514810]">
                Review your items, update quantities, and proceed to checkout securely.
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

        {/* Empty Cart */}
        {cart.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="text-5xl" role="img" aria-label="cart">🛒</span>
            <h2 className="mt-4 text-2xl font-black text-[#202016]">
              Your cart is empty 🛒
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e7b900] px-7 py-3 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white cursor-pointer active:scale-95"
            >
              <span>🛍️</span>
              <span>Let&apos;s start shopping</span>
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product?._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#e7b900] hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    {/* Product Information */}
                    <div className="flex items-center gap-4">
                      {item.product?.image && (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-1.5 border border-slate-100">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-bold text-[#202016]">
                          {item.product?.name}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          Price: ₹{item.product?.price}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          Subtotal: ₹{(item.product?.price || 0) * item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Decrease */}
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.product?._id,
                            "decrease",
                            item.quantity
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-700 transition hover:bg-[#fff7d6] hover:border-[#e7b900] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      {/* Quantity */}
                      <span className="min-w-8 text-center text-sm font-black text-[#202016]">
                        {item.quantity}
                      </span>

                      {/* Increase */}
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.product?._id,
                            "increase",
                            item.quantity
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-700 transition hover:bg-[#fff7d6] hover:border-[#e7b900] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.product?._id)}
                        className="rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Checkout */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Amount
                  </p>
                  <p className="text-2xl font-black text-[#202016]">
                    ₹{totalPrice}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="rounded-xl bg-[#e7b900] px-8 py-3 text-xs font-black uppercase tracking-wider text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white cursor-pointer active:scale-95"
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Cart;
