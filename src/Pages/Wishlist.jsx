import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import EmptyState from "../Components/EmptyState";
import ErrorState from "../Components/ErrorState";
import { notifyCartUpdated, notifyWishlistUpdated, notifyToast } from "../utils/cartWishlistEvents";

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
      } else {
        console.error("Error fetching wishlist:", err);
        setError("Unable to load your saved items. Please check your connection.");
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
        } else {
          console.error("Error fetching wishlist:", err);
          setError("Unable to load your saved items. Please check your connection.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemove = async (productId, name = "Product") => {
    setProcessingId(productId);
    try {
      const response = await api.delete("/wishlist", {
        data: { productId },
      });
      const updated = response.data?.wishlist?.products ?? [];
      setProducts(updated);
      notifyToast(`Removed ${name} from your wishlist`, "info");
      notifyWishlistUpdated(updated.length);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      notifyToast("Failed to remove item", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    const productId = product._id;
    if ((product.stock ?? 0) <= 0) {
      notifyToast("This product is currently out of stock", "warning");
      return;
    }

    setProcessingId(productId);
    try {
      await api.post("/cart", {
        productId,
        quantity: 1,
      });

      // Remove from wishlist upon moving to cart
      const response = await api.delete("/wishlist", {
        data: { productId },
      });
      const updated = response.data?.wishlist?.products ?? [];
      setProducts(updated);

      notifyToast(`Moved "${product.name}" to your cart! 🛒`, "success");
      notifyCartUpdated();
      notifyWishlistUpdated(updated.length);
    } catch (err) {
      console.error("Error moving to cart:", err);
      notifyToast("Failed to move item to cart", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12">
        <LoadingSpinner message="Loading your saved wishlist..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50/60 py-12 px-4">
        <div className="mx-auto max-w-lg">
          <ErrorState
            title="Wishlist Error"
            message={error}
            onRetry={fetchWishlist}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              My Saved Items
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {products.length} {products.length === 1 ? "item" : "items"} saved in your personal wishlist
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            &larr; Explore Catalog
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Explore our store and tap the heart icon on any product to save it for later."
            actionLabel="Discover Products"
            actionLink="/products"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const inStock = (product.stock ?? 0) > 0;
              const isProcessing = processingId === product._id;

              return (
                <div
                  key={product._id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-md"
                >
                  <div>
                    {/* Image */}
                    <Link
                      to={`/products/${product._id}`}
                      className="relative block aspect-square w-full overflow-hidden rounded-xl bg-slate-50 p-4 transition group-hover:bg-slate-100/70"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                      {!inStock && (
                        <span className="absolute top-2.5 right-2.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                          Out of stock
                        </span>
                      )}
                    </Link>

                    {/* Meta */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {product.category || "General"}
                      </span>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="mt-1 text-sm font-bold text-slate-900 truncate hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="mt-2 text-base font-extrabold text-slate-900">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      disabled={isProcessing || !inStock}
                      className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isProcessing
                        ? "Moving..."
                        : inStock
                        ? "Move to Cart 🛒"
                        : "Out of Stock"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id, product.name)}
                      disabled={isProcessing}
                      className="text-center text-xs font-semibold text-slate-400 hover:text-rose-600 transition py-1 cursor-pointer"
                    >
                      Remove
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
