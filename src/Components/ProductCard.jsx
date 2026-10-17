import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import ProductActions from "./ProductActions";

export default function ProductCard({ product }) {
  if (!product) return null;

  const inStock = (product.stock ?? 0) > 0;
  // Calculate a realistic reference price for display if supported
  const originalPrice = Math.round(Number(product.price || 0) * 1.2);
  const discountPercent = Math.round(((originalPrice - (product.price || 0)) / originalPrice) * 100);

  return (
    <div className="product-card group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition hover:border-slate-300">
      <div>
        {/* Product Image Wrapper */}
        <Link
          to={`/products/${product._id}`}
          className="relative block aspect-square w-full overflow-hidden rounded-xl bg-slate-50 p-3 transition group-hover:bg-slate-100/70"
          aria-label={`View details of ${product.name}`}
        >
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}

          {/* Stock Badge */}
          {!inStock ? (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold tracking-tight text-white backdrop-blur-xs">
              Out of stock
            </span>
          ) : (
            product.stock <= 3 && (
              <span className="absolute right-2.5 top-2.5 z-10 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Only {product.stock} left
              </span>
            )
          )}

          <ProductImage
            src={product.image}
            alt={product.name}
            className="product-image h-full w-full object-contain"
          />
        </Link>

        {/* Product Meta */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            {product.category ? (
              <span className="capitalize text-slate-600 font-semibold truncate max-w-[120px]">
                {product.category}
              </span>
            ) : (
              <span className="text-slate-400">Featured</span>
            )}

            <div className="flex items-center gap-1 text-amber-500">
              <span>★</span>
              <span className="font-semibold text-slate-700">
                {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
              </span>
            </div>
          </div>

          <Link to={`/products/${product._id}`}>
            <h3 className="mt-1.5 text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {product.description || "Thoughtfully designed everyday essential."}
          </p>
        </div>
      </div>

      {/* Price & Actions Row */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-extrabold text-slate-900">
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </span>
          {discountPercent > 0 && (
            <span className="text-[11px] text-slate-400 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <ProductActions productId={product._id} inStock={inStock} />
      </div>
    </div>
  );
}
