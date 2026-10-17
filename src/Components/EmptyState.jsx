import { Link } from "react-router-dom";

export default function EmptyState({
  icon = "🔍",
  title = "No items found",
  description = "Try adjusting your search query, selecting another category, or resetting your filters.",
  actionLabel,
  actionLink,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200/90 bg-white p-10 sm:p-16 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl text-stone-600 mb-4">
        {icon}
      </div>
      <h3 className="font-editorial text-xl sm:text-2xl font-normal tracking-tight text-stone-900">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-xs sm:text-sm text-stone-500 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
