import { Link } from "react-router-dom";

export default function CategoryCard({ name, icon, count, link }) {
  const targetLink = link || `/products?category=${encodeURIComponent(name)}`;

  return (
    <Link
      to={targetLink}
      className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition hover:border-slate-400 hover:shadow-md hover:-translate-y-1"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 transition group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white">
        {icon || "🛍️"}
      </div>
      <h3 className="mt-3 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-900">
        {name}
      </h3>
      {count !== undefined && (
        <span className="mt-0.5 text-[11px] text-slate-400">
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </Link>
  );
}
