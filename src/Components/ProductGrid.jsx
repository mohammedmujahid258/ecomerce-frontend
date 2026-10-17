import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function ProductGrid({
  products = [],
  loading = false,
  error = "",
  onRetry,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your search query, selecting another category, or resetting your filters.",
  emptyActionLabel,
  actionLink,
  onEmptyAction,
}) {
  if (error) {
    return (
      <div className="py-6">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionLink={actionLink}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 max-[400px]:grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
