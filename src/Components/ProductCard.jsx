import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import ProductActions from "./ProductActions";

export default function ProductCard({ product }) {
  if (!product) return null;

  const inStock = (product.stock ?? 0) > 0;
  // Calculate a reference price only if price exists
  const hasDiscount = Boolean(product.originalPrice && Number(product.originalPrice) > Number(product.price));
  const displayOriginalPrice = hasDiscount
    ? Number(product.originalPrice)
    : Math.round(Number(product.price || 0) * 1.2);
  const discountPercent = hasDiscount
    ? Math.round(((displayOriginalPrice - Number(product.price)) / displayOriginalPrice) * 100)
    : 0;

  return (
    <div className="product-card group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs transition hover:border-stone-400 hover:shadow-md">
      <div>
        {/* Product Image Link Container */}
        <Link
          to={`/products/${product._id}`}
          className="relative block aspect-square w-full overflow-hidden rounded-xl bg-stone-50/80 p-3.5 transition group-hover:bg-stone-100/70"
          aria-label={`View details of ${product.name}`}
        >
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}

          {/* Stock Status Badge */}
          {!inStock ? (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-stone-900/85 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              Out of stock
            </span>
          ) : product.stock <= 3 ? (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
              Only {product.stock} left
            </span>
          ) : null}

          <ProductImage
            src={product.image}
            alt={product.name}
            className="product-image h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Product Meta Info */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
            {product.category ? (
              <span className="uppercase tracking-wider font-semibold text-stone-500 truncate max-w-[130px]">
                {product.category}
              </span>
            ) : (
              <span className="uppercase tracking-wider">Curated</span>
            )}

            {product.rating && (
              <div className="flex items-center gap-1 text-stone-700">
                <span>★</span>
                <span className="font-semibold text-[11px]">
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <Link to={`/products/${product._id}`}>
            <h3 className="mt-1.5 text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-stone-600 transition">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-1 text-xs text-stone-500">
            {product.description || "Thoughtfully designed everyday essential."}
          </p>
        </div>
      </div>

      {/* Price & Actions Row */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-stone-900">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-stone-400 line-through">
                ₹{displayOriginalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-stone-400">
            {inStock ? "In stock" : "Sold out"}
          </span>
        </div>

        {/* Working Actions Bar: View Product + Cart + Wishlist */}
        <div className="flex items-center gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white py-2 px-2.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-50 hover:border-stone-400"
          >
            View Details
          </Link>

          <ProductActions productId={product._id} inStock={inStock} />
        </div>
      </div>
    </div>
  );
}
