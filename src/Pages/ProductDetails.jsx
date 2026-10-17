import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import ProductGrid from "../Components/ProductGrid";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import { notifyCartUpdated, notifyWishlistUpdated, notifyToast } from "../utils/cartWishlistEvents";

function HeartIcon({ className = "w-5 h-5", filled = false }) {
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

function CartIcon({ className = "w-5 h-5" }) {
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

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cart & Wishlist state
  const [quantity, setQuantity] = useState(1);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProductData = async () => {
      try {
        const token = localStorage.getItem("token");
        const requests = [
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`).catch(() => ({ data: { reviews: [] } })),
          api.get("/products").catch(() => ({ data: { products: [] } })),
        ];

        if (token) {
          requests.push(api.get("/orders").catch(() => ({ data: { orders: [] } })));
          requests.push(api.get("/users/profile").catch(() => ({ data: { user: null } })));
          requests.push(api.get("/wishlist").catch(() => ({ data: { wishlist: { products: [] } } })));
        }

        const [productRes, reviewRes, allProductsRes, ordersRes, profileRes, wishlistRes] =
          await Promise.all(requests);

        if (!isMounted) return;

        const currentProduct = productRes.data?.product;
        if (!currentProduct) {
          throw new Error("Product not found");
        }
        setProduct(currentProduct);
        setSelectedImageIndex(0);
        setQuantity(1);

        // Save to recently viewed history
        try {
          const viewed = JSON.parse(localStorage.getItem("recently_viewed_ids") || "[]");
          const updated = [id, ...viewed.filter((item) => item !== id)].slice(0, 10);
          localStorage.setItem("recently_viewed_ids", JSON.stringify(updated));
        } catch {
          // ignore localStorage parsing errors
        }

        // Customer Reviews
        const fetchedReviews =
          reviewRes.data?.reviews ?? reviewRes.data?.review ?? [];
        setReviews(fetchedReviews);

        // Related Products from same category
        const all = allProductsRes.data?.products ?? [];
        const related = all
          .filter(
            (p) =>
              p._id !== id &&
              p.category &&
              currentProduct.category &&
              p.category.toLowerCase().trim() === currentProduct.category.toLowerCase().trim()
          )
          .slice(0, 4);
        setRelatedProducts(
          related.length > 0 ? related : all.filter((p) => p._id !== id).slice(0, 4)
        );

        // User & Wishlist status
        if (profileRes?.data) {
          setCurrentUser(profileRes.data.user || profileRes.data.data?.user || profileRes.data);
        }
        if (wishlistRes?.data?.wishlist?.products) {
          const wishProducts = wishlistRes.data.wishlist.products;
          const isWish = wishProducts.some((p) => (p._id || p.id || p) === id);
          setInWishlist(isWish);
        }

        // Verified purchase check
        if (ordersRes?.data) {
          const orders = ordersRes.data.orders ?? ordersRes.data.data ?? [];
          const hasPurchased = orders.some((order) =>
            (order.items ?? []).some((item) => {
              const purchasedProduct = item.product ?? item.productId;
              const purchasedProductId =
                typeof purchasedProduct === "object"
                  ? purchasedProduct._id || purchasedProduct.id
                  : purchasedProduct;
              return String(purchasedProductId) === String(id);
            })
          );
          setCanReview(hasPurchased);
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load product details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setCheckingPurchase(false);
        }
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Gallery image list (main image + any extra images if present)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  const activeImage = galleryImages[selectedImageIndex] || product?.image;

  // Genuine discount data
  const hasRealDiscount = Boolean(
    product?.originalPrice && Number(product.originalPrice) > Number(product.price)
  );
  const discountPercent = hasRealDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  const inStock = Boolean(product && (product.stock ?? 0) > 0);
  const maxStock = product ? Math.max(1, product.stock ?? 1) : 1;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notifyToast("Please sign in to add items to your cart", "info");
      navigate("/login");
      return;
    }

    if (!inStock) {
      notifyToast("This product is currently out of stock", "warning");
      return;
    }

    setIsAddingCart(true);
    try {
      await api.post("/cart", {
        productId: id,
        quantity,
      });
      notifyToast(`Added ${quantity} ${quantity === 1 ? "item" : "items"} to your cart!`, "success");
      notifyCartUpdated();
    } catch (err) {
      console.error("Error adding to cart:", err);
      notifyToast(err.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setIsAddingCart(false);
    }
  };

  // Handle Wishlist Toggle
  const handleToggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notifyToast("Please sign in to save items to your wishlist", "info");
      navigate("/login");
      return;
    }

    setIsUpdatingWishlist(true);
    try {
      if (inWishlist) {
        await api.delete("/wishlist", { data: { productId: id } });
        setInWishlist(false);
        notifyToast("Removed from your wishlist", "info");
      } else {
        await api.post("/wishlist", { productId: id });
        setInWishlist(true);
        notifyToast("Saved to your wishlist", "success");
      }
      notifyWishlistUpdated();
    } catch (err) {
      console.error("Error updating wishlist:", err);
      notifyToast("Could not update wishlist", "error");
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  // Handle Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!canReview) {
      setReviewError("Only customers who have purchased this product can submit a verified review.");
      return;
    }

    if (!rating || !comment.trim()) {
      setReviewError("Please choose a rating and enter a review comment.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    try {
      const response = await api.post("/reviews", {
        productId: id,
        rating,
        comment: comment.trim(),
      });

      const newReview = response.data?.review;
      if (newReview) {
        setReviews((prev) => [newReview, ...prev]);
      }
      setComment("");
      setRating(5);
      notifyToast("Thank you! Your review has been published.", "success");
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Edit Review
  const handleUpdateReview = async (e, reviewId) => {
    e.preventDefault();
    if (!editComment.trim()) {
      setReviewError("Comment cannot be empty.");
      return;
    }

    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment.trim(),
      });

      const updated = response.data?.review;
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)));
      setEditingReviewId(null);
      notifyToast("Review updated successfully", "success");
    } catch (err) {
      console.error("Error updating review:", err);
      setReviewError(err.response?.data?.message || "Failed to update review.");
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      notifyToast("Review deleted", "info");
    } catch (err) {
      console.error("Error deleting review:", err);
      notifyToast(err.response?.data?.message || "Failed to delete review", "error");
    }
  };

  const isMyReview = (review) => {
    const revUserId = review.user?._id || review.user?.id || review.userId;
    const currentUserId = currentUser?._id || currentUser?.id;
    return Boolean(revUserId && currentUserId && String(revUserId) === String(currentUserId));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <LoadingSpinner message="Loading product details..." />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#faf8f5] py-20 px-4">
        <div className="mx-auto max-w-xl">
          <ErrorState
            title="Product Not Available"
            message={error || "The product you requested could not be located in our catalog."}
            onRetry={() => navigate("/products")}
          />
          <div className="mt-6 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition"
            >
              &larr; Back to Shop Collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Top Navigation Row: Back Link & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-stone-900 transition">
              Shop
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  to={`/products?category=${encodeURIComponent(product.category.toLowerCase())}`}
                  className="capitalize hover:text-stone-900 transition"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="font-semibold text-stone-900 truncate max-w-xs">{product.name}</span>
          </nav>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-900 transition"
          >
            <span>&larr;</span>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* =========================================================================
            MAIN PRODUCT SHOWCASE (Left: Large Images, Right: Product Details)
            ========================================================================= */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* LEFT COLUMN: PRODUCT IMAGES & GALLERY (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col items-center">
              {/* Main Featured Image Container */}
              <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-2xl bg-stone-50/80 p-6 sm:p-10 flex items-center justify-center border border-stone-200/80 group">
                {/* Discount Badge (Only when real data supports it) */}
                {hasRealDiscount && discountPercent > 0 && (
                  <span className="absolute top-4 left-4 z-10 rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white shadow-xs">
                    Save {discountPercent}%
                  </span>
                )}

                {/* Stock Indicator Pill */}
                {!inStock ? (
                  <span className="absolute bottom-4 left-4 z-10 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                    Currently Out of stock
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="absolute bottom-4 left-4 z-10 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    Only {product.stock} units left
                  </span>
                ) : null}

                <ProductImage
                  src={activeImage}
                  alt={product.name}
                  className="max-h-[380px] w-full object-contain transition duration-500 group-hover:scale-105 cursor-zoom-in"
                />
              </div>

              {/* Multi-Image Gallery Thumbnails (Only when multiple images exist) */}
              {galleryImages.length > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 p-1 bg-stone-50 transition cursor-pointer ${
                        selectedImageIndex === idx
                          ? "border-stone-900 shadow-xs"
                          : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT INFO & SHOPPING INTERACTIONS (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Department & Rating Meta */}
                <div className="flex items-center justify-between">
                  {product.category ? (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      Curated Item
                    </span>
                  )}

                  {product.rating && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-700">
                      <span className="text-amber-500">★</span>
                      <span className="font-bold">
                        {Number(product.rating).toFixed(1)}
                      </span>
                      <span className="text-stone-400">
                        ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Title */}
                <h1 className="mt-3 font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900 leading-[1.15]">
                  {product.name}
                </h1>

                {/* Price Row */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  {hasRealDiscount && (
                    <>
                      <span className="text-lg text-stone-400 line-through">
                        ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        ₹{(Number(product.originalPrice) - Number(product.price)).toLocaleString("en-IN")} Discount
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Status Indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      inStock ? "bg-emerald-500" : "bg-stone-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      inStock ? "text-emerald-700" : "text-stone-500"
                    }`}
                  >
                    {inStock
                      ? `In Stock (${product.stock} units available)`
                      : "Currently Out of Stock"}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-6 border-t border-stone-100 pt-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                    Product Description
                  </h2>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    {product.description ||
                      "Thoughtfully selected everyday essential verified for durability, authentic craftsmanship, and daily utility."}
                  </p>
                </div>

                {/* Real Supported Variants (Only when data exists) */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div className="mt-6 border-t border-stone-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      Available Colors
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <span key={c} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div className="mt-6 border-t border-stone-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      Available Sizes
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <span key={s} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editorial Trust Specifications */}
                <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-stone-50/70 p-4 border border-stone-200/80 text-xs">
                  <div>
                    <span className="text-stone-400">Delivery:</span>
                    <p className="font-semibold text-stone-800">Free over ₹999</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Verification:</span>
                    <p className="font-semibold text-stone-800">100% Genuine</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Dispatch:</span>
                    <p className="font-semibold text-stone-800">Fast Express Shipping</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Support:</span>
                    <p className="font-semibold text-stone-800">Direct Customer Care</p>
                  </div>
                </div>
              </div>

              {/* Shopping Interactions: Quantity Selector, Add to Cart & Wishlist */}
              <div className="mt-8 border-t border-stone-100 pt-6">
                {inStock ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between rounded-full border border-stone-300 bg-white p-1 sm:w-36 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold text-stone-900 px-2">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                        disabled={quantity >= maxStock}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAddingCart}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 px-8 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-98 disabled:bg-stone-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <CartIcon className="w-4 h-4" />
                      <span>{isAddingCart ? "Adding to Cart..." : "Add to Cart"}</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      disabled={isUpdatingWishlist}
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition active:scale-95 cursor-pointer shadow-2xs ${
                        inWishlist
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                      }`}
                      aria-label={inWishlist ? "In Wishlist" : "Save to Wishlist"}
                      title={inWishlist ? "Saved in Wishlist" : "Save to Wishlist"}
                    >
                      <HeartIcon className="w-5 h-5" filled={inWishlist} />
                    </button>
                  </div>
                ) : (
                  /* Sold Out Notice with Save to Wishlist CTA */
                  <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-center">
                    <p className="text-xs font-semibold text-stone-800">
                      This item is currently sold out. Save it to your wishlist to receive updates when back in stock.
                    </p>
                    <div className="mt-3 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        disabled={isUpdatingWishlist}
                        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition cursor-pointer"
                      >
                        <HeartIcon className="w-4 h-4" filled={inWishlist} />
                        <span>{inWishlist ? "Saved in Wishlist" : "Save to Wishlist"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CUSTOMER REVIEWS SECTION
            ========================================================================= */}
        <section className="mt-14 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Customer Feedback
              </span>
              <h2 className="mt-1 font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-stone-900">
                Reviews & Ratings
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Authentic opinions from verified purchasers of this item.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-stone-900">
                {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
              </span>
              <div className="text-sm text-amber-500">★★★★★</div>
              <span className="text-xs text-stone-400">({reviews.length} total)</span>
            </div>
          </div>

          {/* Verified Review Form */}
          {checkingPurchase ? (
            <p className="mt-6 text-xs text-stone-400">Checking verified purchase eligibility...</p>
          ) : canReview ? (
            <form onSubmit={handleSubmitReview} className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-800">
                Share Your Experience
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                As a verified buyer, your review helps others make thoughtful choices.
              </p>

              {/* Star Picker */}
              <div className="mt-3 flex items-center gap-1">
                <span className="text-xs font-semibold text-stone-700 mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-lg transition hover:scale-110 cursor-pointer"
                    aria-label={`Rate ${star} stars`}
                  >
                    <span className={star <= rating ? "text-amber-500" : "text-stone-300"}>★</span>
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-stone-700">{rating} of 5 Stars</span>
              </div>

              {/* Review Textarea */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here... (e.g. build quality, comfort, performance)"
                rows={3}
                className="mt-3 w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
              />

              {reviewError && (
                <p className="mt-2 text-xs font-semibold text-rose-600">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="mt-3 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submittingReview ? "Submitting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs text-stone-500">
              ℹ Only customers who have purchased this product can leave a verified review.
            </div>
          )}

          {/* Customer Reviews List */}
          <div className="mt-8 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                No customer reviews yet. Be the first verified customer to share your thoughts!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs"
                >
                  {editingReviewId === rev._id ? (
                    <form onSubmit={(e) => handleUpdateReview(e, rev._id)}>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditRating(s)}
                            className="text-lg cursor-pointer"
                          >
                            <span className={s <= editRating ? "text-amber-500" : "text-stone-300"}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-stone-400"
                        rows={2}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                            {(rev.user?.name || "U")[0].toUpperCase()}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-stone-900">
                              {rev.user?.name || "Customer"}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Verified Purchase
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          {"★".repeat(Number(rev.rating) || 5)}
                          {"☆".repeat(5 - (Number(rev.rating) || 5))}
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-stone-600 leading-relaxed">
                        {rev.comment}
                      </p>

                      {isMyReview(rev) && (
                        <div className="mt-3 flex gap-3 border-t border-stone-100 pt-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(rev._id);
                              setEditRating(rev.rating || 5);
                              setEditComment(rev.comment || "");
                            }}
                            className="font-semibold text-stone-800 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev._id)}
                            className="font-semibold text-rose-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================================================================
            RELATED PRODUCTS SECTION
            ========================================================================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                Complete Your Look
              </span>
              <h2 className="mt-1 font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-stone-900">
                Related Products
              </h2>
            </div>

            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </main>
  );
}
