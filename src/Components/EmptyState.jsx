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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-10 sm:p-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
