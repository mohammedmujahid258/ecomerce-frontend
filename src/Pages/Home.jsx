import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import AnnouncementBar from "../Components/AnnouncementBar";
import ProductCard from "../Components/ProductCard";
import { ProductGridSkeleton } from "../Components/LoadingSkeleton";
import heroImage from "../assets/ecommerce-hero.jpg";

const categoryCatalog = [
  {
    name: "Electronics",
    query: "electronics",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    badge: "Tech & Devices",
  },
  {
    name: "Mobiles",
    query: "mobile",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
      </svg>
    ),
    badge: "Flagship Phones",
  },
  {
    name: "Fashion & Fabric",
    query: "fabric",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
    badge: "Clothing & Apparel",
  },
  {
    name: "Footwear & Shoes",
    query: "shoes",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 17l6-6 4 4 6-6" />
        <path d="M2 19h20v2H2z" />
      </svg>
    ),
    badge: "Casual & Sport",
  },
  {
    name: "Eyewear & Accessories",
    query: "glass",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="6" cy="14" r="4" />
        <circle cx="18" cy="14" r="4" />
        <path d="M10 14h4" />
        <path d="M2 14l2-6h2" />
        <path d="M22 14l-2-6h-2" />
      </svg>
    ),
    badge: "Style Essentials",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/products")
      .then(({ data }) => {
        if (!isMounted) return;
        const allProducts = data.products ?? [];
        setProducts(allProducts);

        // Load recently viewed IDs from localStorage
        try {
          const storedIds = JSON.parse(localStorage.getItem("recently_viewed_ids") || "[]");
          if (Array.isArray(storedIds) && storedIds.length > 0) {
            const matched = storedIds
              .map((id) => allProducts.find((p) => p._id === id))
              .filter(Boolean)
              .slice(0, 4);
            setRecentlyViewed(matched);
          }
        } catch {
          // ignore parsing error
        }
      })
      .catch((err) => {
        console.error("Failed to fetch homepage products:", err);
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Selected Products: Top 4 featured items
  const selectedProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  // 2. Trending / Best Sellers: sorted by stock or rating
  const trendingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (Number(b.rating) || 4.8) - (Number(a.rating) || 4.8))
      .slice(0, 4);
  }, [products]);

  // 3. Special Offers products (items with discounts or affordable prices)
  const specialOffers = useMemo(() => {
    return products.filter((p) => Number(p.price) <= 1000).slice(0, 2);
  }, [products]);

  return (
    <main className="store-shell">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Hero Banner */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left Hero Content */}
            <div className="flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                New Season Collection 2026
              </span>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
                Elevate your everyday <span className="text-blue-600">lifestyle.</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                Thoughtfully curated smartphones, premium electronics, fashion, and lifestyle essentials backed by secure checkout and doorstep delivery.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to="/products"
                  className="rounded-xl bg-slate-900 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95"
                >
                  Shop Now &rarr;
                </Link>
                <Link
                  to="/products?category=electronics"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-95"
                >
                  Explore Tech
                </Link>
              </div>

              {/* Trust highlights */}
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-100 pt-6 w-full max-w-md">
                <div>
                  <p className="text-xl font-black text-slate-900">100%</p>
                  <p className="text-[11px] font-medium text-slate-500">Verified Authentic</p>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">24/7</p>
                  <p className="text-[11px] font-medium text-slate-500">Fast Support</p>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">₹999+</p>
                  <p className="text-[11px] font-medium text-slate-500">Free Express Delivery</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="relative">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl">
                <img
                  src={heroImage}
                  alt="MyStore Premium Everyday Collection"
                  className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
                  loading="eager"
                />
              </div>

              {/* Floating Highlight Card */}
              <div className="absolute -bottom-5 -left-5 sm:bottom-6 sm:-left-6 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md max-w-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-xl">
                  ✦
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Curated Quality</p>
                  <p className="text-[11px] text-slate-500">Hand-selected products with guaranteed warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Selected Products Section (Prominently Near the Top) */}
      <section className="py-14 sm:py-16 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Staff Picks
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Selected Products
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Our hand-picked essentials, popular for design, durability, and daily performance.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Browse All Products &rarr;
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : selectedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {selectedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No products available right now. Visit our products page shortly.
            </div>
          )}
        </div>
      </section>

      {/* 4. Shop by Category Section */}
      <section className="py-14 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Collections
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Easily navigate across smartphone tech, everyday clothing, accessories, and footwear.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categoryCatalog.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.query)}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 text-center transition hover:border-slate-400 hover:bg-white hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xs transition group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                  {cat.icon}
                </div>
                <h3 className="mt-4 text-xs sm:text-sm font-bold text-slate-900">
                  {cat.name}
                </h3>
                <span className="mt-1 text-[11px] font-medium text-slate-500">
                  {cat.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trending / Best Sellers Section */}
      <section className="py-14 sm:py-16 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Top Rated
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Trending & Best Sellers
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Top customer ratings and community favorites across our real product catalog.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View More Trending &rarr;
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {trendingProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 6. Special Offers Section (Only when actual offers exist) */}
      {specialOffers.length > 0 && (
        <section className="py-14 sm:py-16 bg-white border-y border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Save Big Today
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Special Value Deals
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Grab exceptional products under ₹1,000 before stocks deplete.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialOffers.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs transition hover:shadow-md"
                >
                  <div className="aspect-square w-36 sm:w-44 shrink-0 overflow-hidden rounded-2xl bg-white p-3 border border-slate-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center">
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      Limited Quantity Deal
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {item.description || "Thoughtfully designed for daily convenience."}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{Math.round(Number(item.price) * 1.3).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Link
                      to={`/products/${item._id}`}
                      className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
                    >
                      View Deal &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Recently Viewed Section (Reliably read from localStorage) */}
      {recentlyViewed.length > 0 && (
        <section className="py-14 sm:py-16 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Browsing History
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Recently Viewed
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recentlyViewed.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Trust Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-xl">
                🛡️
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Secure Checkout</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  256-bit encrypted transactions supporting online UPI, Cards, and Cash on Delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-xl">
                🚚
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Express Delivery</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Fast, tracked shipping on every order with free delivery above ₹999.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold text-xl">
                ★
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Authentic Catalog</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Every product listed in our catalog is directly sourced and verified for quality.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold text-xl">
                💬
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Dedicated Support</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Questions about orders or returns? Reach out anytime via our order portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
