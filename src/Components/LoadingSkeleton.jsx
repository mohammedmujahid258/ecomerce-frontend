export function ProductSkeleton() {
  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-stone-200/80 bg-white p-3.5 sm:p-4 shadow-xs animate-pulse">
      <div>
        <div className="aspect-square w-full rounded-xl bg-stone-100" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-1/4 rounded-full bg-stone-100" />
          <div className="h-4 w-4/5 rounded bg-stone-200" />
          <div className="h-3 w-full rounded bg-stone-100" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="h-5 w-1/3 rounded bg-stone-200" />
        <div className="h-8 w-20 rounded-xl bg-stone-200" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 max-[400px]:grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

export default function LoadingSpinner({ message = "Loading products..." }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
        <div className="absolute inset-0 rounded-full border-2 border-stone-900 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
        {message}
      </p>
    </div>
  );
}
