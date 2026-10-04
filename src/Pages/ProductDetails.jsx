import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import ProductActions from "../Components/ProductActions";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const requests = [
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`),
        ];

        const token = localStorage.getItem("token");
        if (token) {
          requests.push(api.get("/orders"));
          requests.push(api.get("/users/profile"));
        }

        const [productResponse, reviewResponse, ordersResponse, profileResponse] = await Promise.all(requests);

        setProduct(productResponse.data.product);
        setReviews(reviewResponse.data.reviews ?? reviewResponse.data.review ?? []);
        setCurrentUser(profileResponse?.data?.user ?? profileResponse?.data ?? null);

        if (ordersResponse) {
          const orders = ordersResponse.data.orders ?? ordersResponse.data.data ?? [];
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
      } catch (requestError) {
        console.error("Error loading product:", requestError);
        setError(requestError.response?.data?.message || "Unable to load product.");
      } finally {
        setCheckingPurchase(false);
      }
    };

    loadDetails();
  }, [id]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!canReview) {
      setError("You can review this product after purchasing it.");
      return;
    }

    if (!rating || !comment.trim()) {
      setError("Please select a rating and write a comment.");
      return;
    }

    try {
      const response = await api.post("/reviews", {
        productId: id,
        rating,
        comment: comment.trim(),
      });

      const newReview = response.data.review;
      if (newReview) {
        setReviews((previousReviews) => [...previousReviews, newReview]);
      }

      setRating(0);
      setComment("");
      setError("");
    } catch (requestError) {
      console.error("Error adding review:", requestError);
      setError(requestError.response?.data?.message || "Unable to add review.");
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setError("");
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleUpdateReview = async (event, reviewId) => {
    event.preventDefault();

    if (!reviewId || !editRating || !editComment.trim()) {
      setError("Rating and comment are required.");
      return;
    }

    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment.trim(),
      });

      const updatedReview = response.data.review;
      setReviews((previousReviews) =>
        previousReviews.map((review) =>
          review._id === reviewId ? updatedReview : review
        )
      );

      cancelEditing();
      setError("");
    } catch (requestError) {
      console.error("Error updating review:", requestError);
      setError(requestError.response?.data?.message || "Unable to update review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((previousReviews) =>
        previousReviews.filter((review) => review._id !== reviewId)
      );
    } catch (requestError) {
      console.error("Error deleting review:", requestError);
      setError(requestError.response?.data?.message || "Unable to delete review.");
    }
  };

  const ownsReview = (review) => {
    const reviewUserId = review.user?._id || review.user?.id || review.userId;
    const currentUserId = currentUser?._id || currentUser?.id;

    return Boolean(reviewUserId && currentUserId && String(reviewUserId) === String(currentUserId));
  };

  if (!product) {
    return <p className="p-6">{error || "Loading product..."}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-xl bg-white p-6 shadow-md md:grid-cols-2">
        <div className="flex min-h-80 items-center justify-center rounded-xl bg-gray-100 p-6">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-96 w-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-gray-600">{product.description}</p>
          <p className="mt-6 text-2xl font-semibold">Price: ₹{product.price}</p>
          <p className="mt-2 text-gray-600">Category: {product.category || "-"}</p>
          <p className="mt-2 text-gray-600">Stock: {product.stock ?? 0}</p>
          <div className="mt-6 max-w-xs">
            <ProductActions productId={product._id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">

      {checkingPurchase ? (
        <p className="mt-8 text-gray-600">Checking purchase access...</p>
      ) : canReview ? (
        <form onSubmit={handleSubmitReview} className="mt-8">
          <h2 className="text-2xl font-bold">Give a Rating</h2>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`rounded px-4 py-2 ${rating >= star ? "bg-yellow-400" : "bg-gray-200"}`}
              >
                {star}
              </button>
            ))}
          </div>

          <p className="mt-3">Selected Rating: {rating}/5</p>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write your review..."
            className="mt-3 w-full rounded-lg border p-3"
            rows={4}
          />
          <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white">
            Submit Review
          </button>
        </form>
      ) : (
        <p className="mt-8 text-gray-600">
          Purchase this product to leave a rating or review.
        </p>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-gray-600">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="mt-4 rounded-xl border-l-4 border-yellow-400 bg-white p-5 shadow-sm">
              {editingReviewId === review._id ? (
                <form onSubmit={(event) => handleUpdateReview(event, review._id)}>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setEditRating(star)}
                        className={`rounded px-3 py-1 ${editRating >= star ? "bg-yellow-400" : "bg-gray-200"}`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(event) => setEditComment(event.target.value)}
                    className="mt-3 w-full rounded border p-2"
                    rows={3}
                  />
                  <button type="submit" className="mt-2 rounded bg-green-600 px-4 py-2 text-white">
                    Save Update
                  </button>
                  <button type="button" onClick={cancelEditing} className="ml-2 rounded bg-gray-400 px-4 py-2 text-white">
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-gray-900">{review.user?.name || "User"}</p>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                      {"★".repeat(Number(review.rating) || 0)}{"☆".repeat(5 - (Number(review.rating) || 0))} {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-4 rounded-lg bg-gray-50 p-3 text-gray-700">{review.comment}</p>
                  {ownsReview(review) && (
                    <>
                      <button type="button" onClick={() => startEditing(review)} className="mt-3 rounded bg-green-600 px-4 py-2 text-white">
                        Update
                      </button>
                      <button type="button" onClick={() => handleDeleteReview(review._id)} className="ml-2 rounded bg-red-500 px-4 py-2 text-white">
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}

export default ProductDetails;
