import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

export default function ProductGrid({
  products = [],
  loading = false,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your search query, selecting another category, or resetting your filters.",
  emptyActionLabel,
  onEmptyAction,
}) {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
