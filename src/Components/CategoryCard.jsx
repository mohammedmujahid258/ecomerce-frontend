import { Link } from "react-router-dom";

export default function CategoryCard({
  name,
  query,
  subtitle,
  image,
  link,
  count,
}) {
  const targetLink = link || `/products?category=${encodeURIComponent(query || name)}`;

  return (
    <Link
      to={targetLink}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white transition-all duration-300 hover:border-stone-400 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Visual Photography Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-stone-50/80 p-5 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-3xl">
            📦
          </div>
        )}
      </div>

      {/* Card Content Footer */}
      <div className="p-4 sm:p-5 border-t border-stone-100 bg-white flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-stone-600 transition">
            {name}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-stone-500 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="text-[11px] font-medium text-stone-400">
            {count !== undefined ? `${count} items` : "Explore Collection"}
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
