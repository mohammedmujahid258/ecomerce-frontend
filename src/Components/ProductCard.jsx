import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import ProductImage from "./ProductImage";
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

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  if (!product) return null;

  const inStock = (product.stock ?? 0) > 0;

  // Genuine discount calculations: only when real originalPrice > price
  const hasRealDiscount = Boolean(
    product.originalPrice && Number(product.originalPrice) > Number(product.price)
  );
  const discountPercent = hasRealDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  // Handle Quick Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      notifyToast("Please sign in to add items to your cart", "info");
      navigate("/login");
      return;
    }

    if (!inStock) {
      notifyToast("Sorry, this item is currently out of stock", "warning");
      return;
    }

    setIsAddingToCart(true);
    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: 1,
      });
      notifyToast(`Added ${product.name} to cart`, "success");
      notifyCartUpdated();
    } catch (error) {
      if (error.response?.status === 401) {
        notifyToast("Session expired. Please sign in again.", "warning");
        navigate("/login");
      } else {
        const errorMsg =
          error.response?.data?.message || "Could not add item to cart. Please try again.";
        notifyToast(errorMsg, "error");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Wishlist Toggle
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      notifyToast("Please sign in to save items to your wishlist", "info");
      navigate("/login");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (inWishlist) {
        await api.delete("/wishlist", { data: { productId: product._id } });
        setInWishlist(false);
        notifyToast("Removed from wishlist", "info");
      } else {
        await api.post("/wishlist", { productId: product._id });
        setInWishlist(true);
        notifyToast("Saved to your wishlist", "success");
      }
      notifyWishlistUpdated();
    } catch (error) {
      if (error.response?.status === 401) {
        notifyToast("Session expired. Please sign in again.", "warning");
        navigate("/login");
      } else {
        const errorMsg =
          error.response?.data?.message || "Could not update wishlist. Please try again.";
        notifyToast(errorMsg, "error");
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="product-card group relative flex flex-col justify-between h-full rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 shadow-xs transition-all duration-300 hover:border-stone-400 hover:shadow-md hover:-translate-y-1">
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-50/80 p-3.5 sm:p-4 flex items-center justify-center">
          {/* Wishlist Button on Top-Right */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            title={inWishlist ? "Saved in Wishlist" : "Save to Wishlist"}
            className={`absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xs border transition active:scale-90 cursor-pointer shadow-xs ${
              inWishlist
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-stone-200/90 bg-white/90 text-stone-600 hover:border-stone-400 hover:text-stone-900"
            }`}
          >
            <HeartIcon className="w-4 h-4" filled={inWishlist} />
          </button>

          {/* Genuine Discount Badge (Only when real data supports it) */}
          {hasRealDiscount && discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}

          {/* Stock Status Badge */}
          {!inStock ? (
            <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-stone-900/85 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              Out of stock
            </span>
          ) : product.stock <= 3 ? (
            <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
              Only {product.stock} left
            </span>
          ) : null}

          {/* Clickable Image linking to Product Details */}
          <Link
            to={`/products/${product._id}`}
            className="block h-full w-full"
            aria-label={`View details of ${product.name}`}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className="product-image h-full w-full object-contain transition duration-500 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Product Meta & Typography */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-stone-400">
            {product.category ? (
              <span className="uppercase tracking-wider font-semibold text-stone-500 truncate max-w-[130px]">
                {product.category}
              </span>
            ) : (
              <span className="uppercase tracking-wider">Curated</span>
            )}

            {product.rating && (
              <div className="flex items-center gap-1 text-stone-700">
                <span className="text-amber-500">★</span>
                <span className="font-semibold text-[11px]">
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <Link to={`/products/${product._id}`} className="block">
            <h3 className="mt-1 font-semibold text-xs sm:text-sm text-stone-900 truncate group-hover:text-stone-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-1 text-xs text-stone-500">
            {product.description || "Thoughtfully designed everyday essential."}
          </p>
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-base sm:text-lg font-bold text-stone-900">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>
            {hasRealDiscount && (
              <span className="text-xs text-stone-400 line-through">
                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-stone-400 shrink-0">
            {inStock ? "In stock" : "Sold out"}
          </span>
        </div>

        {/* Working Action Buttons: View Details + Quick Add to Cart */}
        <div className="flex items-center gap-2">
          {/* View Details Link Button */}
          <Link
            to={`/products/${product._id}`}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white py-2 px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50 text-center whitespace-nowrap min-h-[36px]"
          >
            <span className="relative z-1">View Details</span>
          </Link>

          {/* Quick Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart}
            aria-label={inStock ? `Add ${product.name} to cart` : "Out of stock"}
            title={inStock ? "Add to Cart" : "Out of stock"}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2 px-2.5 sm:px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer min-h-[36px]"
          >
            <CartIcon className="w-3.5 h-3.5 relative z-1" />
            <span className="text-xs font-semibold relative z-1">
              {isAddingToCart ? "Adding..." : inStock ? "Add" : "Out"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
