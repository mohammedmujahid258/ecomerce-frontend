import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const [productResponse, reviewResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`),
        ]);

        setProduct(productResponse.data.product);
        setReviews(reviewResponse.data.reviews ?? reviewResponse.data.review ?? []);
      } catch (requestError) {
        console.error("Error loading product:", requestError);
        setError(requestError.response?.data?.message || "Unable to load product.");
      }
    };

    loadDetails();
  }, [id]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

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

  if (!product) {
    return <p className="p-6">{error || "Loading product..."}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-4">{product.description}</p>
      <p className="mt-4 text-xl font-semibold">Price: ₹{product.price}</p>

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

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-gray-600">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="mt-4 rounded-lg bg-gray-100 p-4">
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
                  <p className="font-semibold">{review.user?.name || "User"}</p>
                  <p>Rating: {review.rating}/5</p>
                  <p className="mt-2">{review.comment}</p>
                  <button type="button" onClick={() => startEditing(review)} className="mt-3 rounded bg-green-600 px-4 py-2 text-white">
                    Update
                  </button>
                  <button type="button" onClick={() => handleDeleteReview(review._id)} className="ml-2 rounded bg-red-500 px-4 py-2 text-white">
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
