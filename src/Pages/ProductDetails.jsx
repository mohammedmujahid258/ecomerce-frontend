import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import ProductCard from "../Components/ProductCard";
import LoadingSpinner from "../Components/LoadingSkeleton";
import ErrorState from "../Components/ErrorState";
import { notifyCartUpdated, notifyWishlistUpdated, notifyToast } from "../utils/cartWishlistEvents";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cart & Wishlist state
  const [quantity, setQuantity] = useState(1);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  // Review state
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

        // Save to recently viewed
        try {
          const viewed = JSON.parse(localStorage.getItem("recently_viewed_ids") || "[]");
          const updated = [id, ...viewed.filter((item) => item !== id)].slice(0, 10);
          localStorage.setItem("recently_viewed_ids", JSON.stringify(updated));
        } catch {
          // ignore localStorage error
        }

        // Reviews
        const fetchedReviews =
          reviewRes.data?.reviews ?? reviewRes.data?.review ?? [];
        setReviews(fetchedReviews);

        // Related Products
        const all = allProductsRes.data?.products ?? [];
        const related = all
          .filter(
            (p) =>
              p._id !== id &&
              p.category &&
              currentProduct.category &&
              p.category.toLowerCase() === currentProduct.category.toLowerCase()
          )
          .slice(0, 4);
        setRelatedProducts(related.length > 0 ? related : all.filter((p) => p._id !== id).slice(0, 4));

        // User & Wishlist status
        if (profileRes?.data) {
          setCurrentUser(profileRes.data.user || profileRes.data.data?.user || profileRes.data);
        }
        if (wishlistRes?.data?.wishlist?.products) {
          const wishProducts = wishlistRes.data.wishlist.products;
          const isWish = wishProducts.some((p) => (p._id || p.id || p) === id);
          setInWishlist(isWish);
        }

        // Check purchase access for verified reviews
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

  // Handle Add to Cart
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notifyToast("Please sign in to add items to your cart", "info");
      navigate("/login");
      return;
    }

    if (!product || (product.stock ?? 0) <= 0) {
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
      <main className="min-h-screen bg-slate-50 py-12">
        <LoadingSpinner message="Loading product details..." />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-xl">
          <ErrorState
            title="Product Not Available"
            message={error || "The product you requested could not be located in our catalog."}
            onRetry={() => navigate("/products")}
          />
        </div>
      </main>
    );
  }

  const inStock = (product.stock ?? 0) > 0;
  const originalPrice = Math.round(Number(product.price || 0) * 1.25);
  const discountPercent = Math.round(((originalPrice - Number(product.price || 0)) / originalPrice) * 100);

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-900">
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="capitalize hover:text-slate-900"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Hero Card */}
        <div className="grid grid-cols-1 gap-10 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs lg:grid-cols-2">
          {/* Left: Product Image & Gallery */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex items-center justify-center">
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 z-10 rounded-md bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                  Save {discountPercent}%
                </span>
              )}

              <ProductImage
                src={product.image}
                alt={product.name}
                className="max-h-[360px] w-full object-contain"
              />
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                  {product.category || "General"}
                </span>

                <div className="flex items-center gap-1 text-sm text-amber-500">
                  <span>★</span>
                  <span className="font-bold text-slate-800">
                    {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                {product.name}
              </h1>

              {/* Price & Savings */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ₹{(originalPrice - product.price).toLocaleString("en-IN")} Discount
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status Badge */}
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    inStock ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    inStock ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {inStock
                    ? `In Stock (${product.stock} units available)`
                    : "Currently Out of Stock"}
                </span>
              </div>

              {/* Description */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Product Overview
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description ||
                    "Expertly crafted for superior everyday utility. Verified by MyStore quality inspection with original manufacturer warranty."}
                </p>
              </div>

              {/* Specifications List */}
              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-slate-400">Category:</span>
                  <p className="font-semibold text-slate-800 capitalize">
                    {product.category || "General"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Dispatch:</span>
                  <p className="font-semibold text-slate-800">Within 24 Hours</p>
                </div>
                <div>
                  <span className="text-slate-400">Warranty:</span>
                  <p className="font-semibold text-slate-800">1 Year Brand Support</p>
                </div>
                <div>
                  <span className="text-slate-400">Authenticity:</span>
                  <p className="font-semibold text-emerald-600">100% Genuine</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Purchase Buttons */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              {inStock ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Control */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1 sm:w-36">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-2">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock ?? 10, q + 1))}
                      disabled={quantity >= (product.stock ?? 10)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAddingCart}
                    className="flex-1 rounded-xl bg-slate-900 py-3.5 px-6 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    {isAddingCart ? "Adding to Cart..." : "Add to Cart 🛒"}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={isUpdatingWishlist}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 cursor-pointer ${
                      inWishlist
                        ? "border-rose-300 bg-rose-50 text-rose-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    aria-label={inWishlist ? "In Wishlist" : "Save to Wishlist"}
                    title={inWishlist ? "In Wishlist" : "Save to Wishlist"}
                  >
                    <span className="text-lg">{inWishlist ? "❤️" : "🤍"}</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center">
                  <p className="text-xs font-bold text-rose-700">
                    This item is currently sold out. Please check back soon or save to your wishlist to track restocks.
                  </p>
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    <span>{inWishlist ? "❤️ Saved in Wishlist" : "🤍 Add to Wishlist"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-12 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Customer Reviews & Ratings
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Real feedback from verified purchasers of this item.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
              </span>
              <div className="text-xs text-amber-500">★★★★★</div>
              <span className="text-xs text-slate-400">({reviews.length} total)</span>
            </div>
          </div>

          {/* Verified Review Submission Form */}
          {checkingPurchase ? (
            <p className="mt-6 text-xs text-slate-400">Checking verified purchase eligibility...</p>
          ) : canReview ? (
            <form onSubmit={handleSubmitReview} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-sm font-bold text-slate-900">Share Your Experience</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                As a verified buyer, your feedback helps other shoppers make informed decisions.
              </p>

              {/* Interactive Star Picker */}
              <div className="mt-3 flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-700 mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-xl transition hover:scale-110 cursor-pointer"
                    aria-label={`Rate ${star} stars`}
                  >
                    <span className={star <= rating ? "text-amber-500" : "text-slate-300"}>★</span>
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5 Stars</span>
              </div>

              {/* Review Text */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here... (e.g. quality, fit, build, battery life)"
                rows={3}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400"
              />

              {reviewError && (
                <p className="mt-2 text-xs font-bold text-rose-600">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="mt-3 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submittingReview ? "Submitting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              ℹ Only customers who have purchased this product can leave a verified review.
            </div>
          )}

          {/* Reviews List */}
          <div className="mt-8 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No reviews yet. Be the first verified customer to share your thoughts!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"
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
                            <span className={s <= editRating ? "text-amber-500" : "text-slate-300"}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                        rows={2}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {(rev.user?.name || "U")[0].toUpperCase()}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
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

                      <p className="mt-3 text-xs text-slate-700 leading-relaxed">
                        {rev.comment}
                      </p>

                      {isMyReview(rev) && (
                        <div className="mt-3 flex gap-3 border-t border-slate-100 pt-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(rev._id);
                              setEditRating(rev.rating || 5);
                              setEditComment(rev.comment || "");
                            }}
                            className="font-semibold text-blue-600 hover:underline cursor-pointer"
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

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                You May Also Like
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Related Products
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
