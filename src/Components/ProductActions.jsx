import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { notifyCartUpdated, notifyWishlistUpdated, notifyToast } from "../utils/cartWishlistEvents";

function CartIcon({ className = "w-4 h-4" }) {
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
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function HeartIcon({ className = "w-4 h-4", filled = false }) {
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

function ProductActions({ productId, inStock = true, showText = false, onActionComplete }) {
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");

  const handleAction = async (event, actionType) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      notifyToast("Please sign in to save items or add to cart", "info");
      navigate("/login");
      return;
    }

    if (actionType === "cart" && !inStock) {
      notifyToast("Sorry, this item is currently out of stock", "warning");
      return;
    }

    setLoadingAction(actionType);
    try {
      if (actionType === "wishlist") {
        if (inWishlist) {
          await api.delete("/wishlist", { data: { productId } });
          setInWishlist(false);
          notifyToast("Removed from your wishlist", "info");
        } else {
          await api.post("/wishlist", { productId });
          setInWishlist(true);
          notifyToast("Saved to your wishlist", "success");
        }
        notifyWishlistUpdated();
      } else {
        await api.post("/cart", {
          productId,
          quantity: 1,
        });
        notifyToast("Added to your shopping cart", "success");
        notifyCartUpdated();
      }

      if (onActionComplete) {
        onActionComplete(actionType);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        notifyToast("Session expired. Please log in again.", "warning");
        navigate("/login");
      } else {
        const errorMsg = error.response?.data?.message || "Action could not be completed. Please try again.";
        notifyToast(errorMsg, "error");
      }
    } finally {
      setLoadingAction("");
    }
  };

  if (showText) {
    return (
      <div className="flex items-center gap-3 w-full">
        <button
          type="button"
          onClick={(e) => handleAction(e, "cart")}
          disabled={loadingAction === "cart" || !inStock}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 sm:px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-98 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-600 cursor-pointer"
        >
          <CartIcon className="w-4 h-4 shrink-0 relative z-1" />
          <span className="relative z-1 whitespace-nowrap">
            {loadingAction === "cart"
              ? "Adding..."
              : inStock
              ? "Add to Cart"
              : "Out of Stock"}
          </span>
        </button>
        <button
          type="button"
          onClick={(e) => handleAction(e, "wishlist")}
          disabled={loadingAction === "wishlist"}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
          className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border transition active:scale-95 cursor-pointer ${
            inWishlist
              ? "border-rose-300 bg-rose-50 text-rose-600 shadow-xs"
              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
          }`}
        >
          <HeartIcon className="w-5 h-5 relative z-1" filled={inWishlist} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex shrink-0 items-center gap-1.5">
      {/* Add to cart icon button */}
      <button
        type="button"
        onClick={(e) => handleAction(e, "cart")}
        disabled={loadingAction === "cart" || !inStock}
        aria-label={inStock ? "Add to cart" : "Out of stock"}
        title={inStock ? "Add to cart" : "Out of stock"}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs transition hover:bg-stone-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer"
      >
        <CartIcon className="w-4 h-4 relative z-1" />
      </button>

      {/* Wishlist icon button */}
      <button
        type="button"
        onClick={(e) => handleAction(e, "wishlist")}
        disabled={loadingAction === "wishlist"}
        aria-label={inWishlist ? "In Wishlist" : "Add to wishlist"}
        title={inWishlist ? "In Wishlist" : "Add to wishlist"}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 cursor-pointer ${
          inWishlist
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900"
        }`}
      >
        <HeartIcon className="w-4 h-4 relative z-1" filled={inWishlist} />
      </button>
    </div>
  );
}

export default ProductActions;
