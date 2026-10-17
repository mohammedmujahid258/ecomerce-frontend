import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../Components/ProductCard";
import CategoryCard from "../Components/CategoryCard";
import { ProductGridSkeleton } from "../Components/LoadingSkeleton";
import heroImage from "../assets/ecommerce-hero.png";

// Categories strictly supported by the real database data
const categoryDefinitions = [
  {
    name: "Smartphones & Mobile",
    query: "mobile",
    subtitle: "Flagship phones and devices",
    fallbackImage: "https://res.cloudinary.com/dwyhaevtl/image/upload/v1746619176/9ee6a2d9-1ba6-48eb-b44e-128da2d80d28.png",
  },
  {
    name: "Electronics & Audio",
    query: "electronics",
    subtitle: "High-fidelity audio & gear",
    fallbackImage: "https://res.cloudinary.com/dwyhaevtl/image/upload/v1746624467/2ee81f71-63c8-4ca7-a461-4130689b9f71.png",
  },
  {
    name: "Apparel & Fabric",
    query: "fabric",
    subtitle: "Everyday essentials & shirts",
    fallbackImage: "https://res.cloudinary.com/dwyhaevtl/image/upload/v1746624584/f69a19c7-2c96-419b-ab29-ee3288a53e6d.png",
  },
  {
    name: "Footwear & Shoes",
    query: "shoes",
    subtitle: "Comfortable athletic sneakers",
    fallbackImage: "https://res.cloudinary.com/dwyhaevtl/image/upload/v1746625064/f1559ee5-045a-4cb6-ba48-eaee127bcfeb.png",
  },
  {
    name: "Eyewear & Accessories",
    query: "glass",
    subtitle: "Modern shades & clean accents",
    fallbackImage: "https://res.cloudinary.com/dwyhaevtl/image/upload/v1746624838/e7fc936c-2f92-411a-82e1-512be03df5fc.png",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/products")
      .then(({ data }) => {
        if (!isMounted) return;
        setProducts(data.products ?? []);
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

  // Section 4: Selected Products (Curated top 4 items from the real backend)
  const selectedProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  // Section 5: Dynamic category mapping using real product images & item counts
  const categoryCardsData = useMemo(() => {
    return categoryDefinitions.map((cat) => {
      const matchingProducts = products.filter((p) =>
        (p.category || "").toLowerCase().includes(cat.query)
      );
      const featuredImage = matchingProducts[0]?.image || cat.fallbackImage;
      const count = matchingProducts.length;

      return {
        ...cat,
        image: featuredImage,
        count,
      };
    });
  }, [products]);

  return (
    <main className="store-shell">
      {/* =========================================================================
          SECTION 3: HERO BANNER (Squarespace Editorial Hero)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f5] border-b border-stone-200/80 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Hero Content */}
            <div className="flex flex-col items-start lg:col-span-7">
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                Curated Collection • 2026 Edition
              </span>

              <h1 className="mt-4 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-900 leading-[1.12]">
                Find Your Next Favorite.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Discover thoughtfully selected products for your everyday life.
              </p>

              {/* Action Buttons with 100% visible text & generous padding */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-full bg-stone-900 px-8 py-3.5 text-xs sm:text-sm font-semibold text-white hover:text-white focus:text-white active:text-white text-center shadow-sm transition hover:bg-stone-800 active:scale-95 cursor-pointer"
                  style={{ color: "#ffffff" }}
                >
                  <span className="relative z-1 font-semibold text-white" style={{ color: "#ffffff" }}>
                    Shop Collection
                  </span>
                </Link>
                <Link
                  to="/products?category=electronics"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-8 py-3.5 text-xs sm:text-sm font-semibold text-stone-800 shadow-xs transition hover:bg-stone-50 hover:border-stone-400 active:scale-95 cursor-pointer"
                >
                  Explore Products
                </Link>
              </div>

              {/* Understated Editorial Highlights */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-stone-200/70 pt-8 w-full max-w-lg">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">100%</p>
                  <p className="mt-0.5 text-[11px] font-medium text-stone-500">Authentic Goods</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">₹999+</p>
                  <p className="mt-0.5 text-[11px] font-medium text-stone-500">Complimentary Delivery</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Direct</p>
                  <p className="mt-0.5 text-[11px] font-medium text-stone-500">Verified Catalog</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="relative lg:col-span-5">
              <div className="relative aspect-4/3 sm:aspect-5/4 lg:aspect-4/3 w-full overflow-hidden rounded-3xl border border-stone-200/90 bg-stone-100 shadow-md">
                <img
                  src={heroImage}
                  alt="Curated everyday products and essentials"
                  className="h-full w-full object-cover object-center transition duration-700 hover:scale-103"
                  loading="eager"
                />
              </div>

              {/* Editorial Badge */}
              <div className="absolute -bottom-4 -left-4 sm:bottom-5 sm:-left-5 hidden sm:flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md max-w-xs">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800 text-sm font-bold">
                  ✦
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Thoughtful Design</p>
                  <p className="text-[11px] text-stone-500">Curated everyday essentials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SELECTED PRODUCTS (Immediately after Hero)
          ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                Curated Showcase
              </span>
              <h2 className="mt-1 font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
                Selected Products
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-stone-500 max-w-lg">
                A selection worth discovering.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-stone-600 transition group"
            >
              <span>View All Collection</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          {/* Product Grid / Skeleton / Empty State */}
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : selectedProducts.length > 0 ? (
            <div className="grid grid-cols-2 max-[400px]:grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {selectedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-12 text-center">
              <p className="text-sm font-semibold text-stone-800">
                No products are currently available in the showcase.
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Please visit our shop page to browse the complete catalog.
              </p>
              <Link
                to="/products"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition"
              >
                Browse Shop
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: SHOP BY CATEGORY (Squarespace Category Cards)
          ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#faf8f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Departments
            </span>
            <h2 className="mt-1 font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-500">
              Explore thoughtfully selected essentials across our curated departments.
            </p>
          </div>

          {/* 5 Real Category Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {categoryCardsData.map((cat) => (
              <CategoryCard
                key={cat.query}
                name={cat.name}
                query={cat.query}
                subtitle={cat.subtitle}
                image={cat.image}
                count={cat.count}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
