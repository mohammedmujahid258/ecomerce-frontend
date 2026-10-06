import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Wishlist() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get("/wishlist");
        console.log("response data :", response.data);
        setProducts(response.data?.wishlist?.products ?? []);
      } catch (err) {
        if (err.response?.status === 404) {
          setProducts([]);
        } else {
          console.log("error fetching wishlist : ", err);
          setError(err.response?.data?.message || "Unable to load wishlist");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete("/wishlist", {
        data: { productId },
      });
      console.log("Remove wishlist response:", response.data);
      setProducts(response.data?.wishlist?.products ?? []);
    } catch (err) {
      console.log("error removing from wishlist", err);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await api.post("/cart", {
        productId: productId,
        quantity: 1,
      });
      console.log("Add to cart response :", response.data);
      setCartMessage("Item added to cart successfully! 🛒");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (err) {
      console.log("Error adding to cart :", err);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7d6] px-4 py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_24px_70px_rgb(32_32_22/18%)]">
          <span className="animate-pulse text-3xl font-black text-[#a48500]">✦</span>
          <p className="mt-3 text-sm font-bold text-[#202016]">Loading wishlist..</p>
        </div>
      </main>
    );
  }

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
        {/* Golden Mesh Header Banner - Matching Login Page Design */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-6 sm:p-8 text-[#202016]">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#a48500]/25 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#202016]">✦</span>
                <p className="text-xs font-bold uppercase tracking-wider text-[#514810]">
                  Your Personal Collection
                </p>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#202016]">
                My Wishlist ❤️
              </h1>
              <p className="mt-1 text-xs text-[#514810]">
                Access your favorite items anytime and move them to cart with a single click.
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

        {cartMessage && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-sm">
            {cartMessage}
          </div>
        )}

        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="text-3xl font-black text-[#a48500]">✦</span>
            <p className="mt-3 text-lg font-bold text-[#202016]">
              Your wishlist is empty.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Browse products and tap the heart icon to save items for later.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-5 inline-block rounded-xl bg-[#e7b900] px-6 py-2.5 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#e7b900] hover:shadow-md"
              >
                <div>
                  {product.image && (
                    <div className="mb-3.5 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain transition duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-[#202016] line-clamp-1">
                      {product.name}
                    </h2>
                    <span className="text-xs font-black text-[#a48500]">✦</span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-baseline justify-between">
                    <p className="text-lg font-black text-[#202016]">
                      ₹{product.price}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => addToCart(product._id)}
                    className="w-full rounded-xl bg-[#e7b900] py-2.5 text-xs font-black text-[#202016] shadow-sm transition hover:bg-[#202016] hover:text-white cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product._id)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;
