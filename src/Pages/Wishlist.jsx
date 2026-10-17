import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import {
  notifyCartUpdated,
  notifyWishlistUpdated,
  notifyToast,
} from "../utils/cartWishlistEvents";

function HeartFilledIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="#e11d48"
      stroke="#e11d48"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CartIcon({ className = "w-3.5 h-3.5" }) {
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

function HeartOutlineIcon({ className = "w-8 h-8" }) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/wishlist");
      const list = response.data?.wishlist?.products ?? [];
      setProducts(list);
      notifyWishlistUpdated(list.length);
    } catch (err) {
      if (err.response?.status === 404) {
        setProducts([]);
        notifyWishlistUpdated(0);
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in to view your wishlist.");
      } else {
        console.error("Error fetching wishlist:", err);
        setError("Unable to load your saved items. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    api
      .get("/wishlist")
      .then((response) => {
        if (!isMounted) return;
        const list = response.data?.wishlist?.products ?? [];
        setProducts(list);
        notifyWishlistUpdated(list.length);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setProducts([]);
          notifyWishlistUpdated(0);
        } else if (err.response?.status === 401) {
          setError("Your session has expired. Please sign in to view your wishlist.");
        } else {
          console.error("Error fetching wishlist:", err);
          setError("Unable to load your saved items. Please check your internet connection.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter valid product objects
  const validProducts = useMemo(() => {
    return (products || []).filter((p) => p && typeof p === "object" && p._id);
  }, [products]);

  // Remove from Wishlist
  const handleRemove = async (productId, name = "Product") => {
    setProcessingId(productId);
    try {
      const response = await api.delete("/wishlist", {
        data: { productId },
      });
      const updated = response.data?.wishlist?.products ?? [];
      setProducts(updated);
      notifyToast(`Removed "${name}" from your wishlist`, "info");
      notifyWishlistUpdated(updated.length);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      notifyToast("Failed to remove item from wishlist", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Add to Cart
  const handleAddToCart = async (product) => {
    const productId = product._id;
    const inStock = (product.stock ?? 0) > 0;

    if (!inStock) {
      notifyToast("This product is currently out of stock", "warning");
      return;
    }

    setProcessingId(productId);
    try {
      await api.post("/cart", {
        productId,
        quantity: 1,
      });

      notifyToast(`Added "${product.name}" to your cart! 🛒`, "success");
      notifyCartUpdated();
    } catch (err) {
      console.error("Error adding to cart:", err);
      notifyToast(err.response?.data?.message || "Failed to add item to cart", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Loading your saved wishlist..." />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <div className="mx-auto max-w-xl">
          <ErrorState
            title="Wishlist Notice"
            message={error}
            onRetry={fetchWishlist}
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
        
        {/* Top Breadcrumb & Return to Shop */}
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
            <span className="font-semibold text-stone-900">My Wishlist</span>
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
            My Wishlist
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            {validProducts.length === 0
              ? "Your personal wishlist is currently empty."
              : `${validProducts.length} ${
                  validProducts.length === 1 ? "saved item" : "saved items"
                } curated for your personal collection.`}
          </p>
        </div>

        {/* Empty Wishlist Condition */}
        {validProducts.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-10 sm:p-16 text-center shadow-xs max-w-2xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-4">
              <HeartOutlineIcon className="w-8 h-8" />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-stone-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 max-w-md mx-auto text-xs sm:text-sm text-stone-500 leading-relaxed">
              Explore our store and tap the heart icon on any product to save your favorite essentials for later.
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
          /* Responsive 4-Column Grid (4 on lg, 3 on md, 2 on sm/mobile) */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {validProducts.map((product) => {
              const inStock = (product.stock ?? 0) > 0;
              const isProcessing = processingId === product._id;
              const hasRealDiscount = Boolean(
                product.originalPrice &&
                  Number(product.originalPrice) > Number(product.price)
              );
              const discountPercent = hasRealDiscount
                ? Math.round(
                    ((Number(product.originalPrice) - Number(product.price)) /
                      Number(product.originalPrice)) *
                      100
                  )
                : 0;

              return (
                <div
                  key={product._id}
                  className="group relative flex flex-col justify-between h-full rounded-2xl border border-stone-200/90 bg-white p-3 sm:p-4 shadow-xs transition-all duration-300 hover:border-stone-400 hover:shadow-md hover:-translate-y-1"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-50/80 p-3 sm:p-4 flex items-center justify-center">
                      
                      {/* Remove from Wishlist Button (Heart toggle) */}
                      <button
                        type="button"
                        onClick={() => handleRemove(product._id, product.name)}
                        disabled={isProcessing}
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove from Wishlist"
                        className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition active:scale-90 cursor-pointer shadow-xs hover:bg-rose-100"
                      >
                        <HeartFilledIcon className="w-4 h-4" />
                      </button>

                      {/* Genuine Discount Badge */}
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

                      {/* Image linking to Product Details */}
                      <Link
                        to={`/products/${product._id}`}
                        className="block h-full w-full"
                        aria-label={`View details of ${product.name}`}
                      >
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                        />
                      </Link>
                    </div>

                    {/* Product Metadata */}
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

                      <div className="mt-2 flex items-baseline gap-1.5 truncate">
                        <span className="text-base sm:text-lg font-bold text-stone-900">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </span>
                        {hasRealDiscount && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={isProcessing || !inStock}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-600 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
                    >
                      <CartIcon className="w-3.5 h-3.5 relative z-1" />
                      <span className="relative z-1">
                        {isProcessing
                          ? "Adding..."
                          : inStock
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </span>
                    </button>

                    {/* Remove Action Link */}
                    <button
                      type="button"
                      onClick={() => handleRemove(product._id, product.name)}
                      disabled={isProcessing}
                      className="w-full text-center text-[11px] font-semibold text-stone-500 hover:text-rose-600 transition py-1 cursor-pointer"
                    >
                      <span className="relative z-1">Remove from Wishlist</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
