import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function CartIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function HeartIcon({ className = "w-3.5 h-3.5", filled = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "#e11d48" : "none"}
      stroke={filled ? "#e11d48" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ProductActions({ productId }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [inWishlist, setInWishlist] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");

  const handleAction = async (event, actionType) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoadingAction(actionType);
    try {
      if (actionType === "wishlist") {
        if (inWishlist) {
          await api.delete("/wishlist", { data: { productId } });
          setInWishlist(false);
          setMessage("Removed from wishlist");
        } else {
          await api.post("/wishlist", { productId });
          setInWishlist(true);
          setMessage("Saved! ❤️");
        }
      } else {
        await api.post("/cart", {
          productId,
          quantity: 1,
        });
        setMessage("Added! 🛒");
      }
      window.setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setMessage(error.response?.data?.message || "Please try again");
        window.setTimeout(() => setMessage(""), 2200);
      }
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="relative mt-2.5 flex items-center gap-2">
      {/* Toast Feedback */}
      {message && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-md bg-[#202016] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          {message}
        </div>
      )}

      {/* Small Cart Symbol Button */}
      <button
        type="button"
        onClick={(e) => handleAction(e, "cart")}
        disabled={loadingAction === "cart"}
        aria-label="Add to cart"
        title="Add to cart"
        className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#202016] px-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#e7b900] hover:text-[#202016] active:scale-95 disabled:opacity-60 cursor-pointer"
      >
        <CartIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{loadingAction === "cart" ? "Adding..." : "Add to Cart"}</span>
      </button>

      {/* Wishlist Symbol Button */}
      <button
        type="button"
        onClick={(e) => handleAction(e, "wishlist")}
        disabled={loadingAction === "wishlist"}
        aria-label="Add to wishlist"
        title="Add to wishlist"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition active:scale-95 cursor-pointer ${
          inWishlist
            ? "border-rose-300 bg-rose-50 text-rose-600 shadow-sm"
            : "border-slate-300 bg-white text-slate-700 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/50"
        }`}
      >
        <HeartIcon className="w-3.5 h-3.5 shrink-0" filled={inWishlist} />
      </button>
    </div>
  );
}

export default ProductActions;
