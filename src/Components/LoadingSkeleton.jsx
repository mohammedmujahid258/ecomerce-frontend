export function ProductSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-slate-100" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="mt-3 flex items-center justify-between pt-2">
          <div className="h-5 w-1/4 rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-3 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-3 border-slate-900 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
        {message}
      </p>
    </div>
  );
}
