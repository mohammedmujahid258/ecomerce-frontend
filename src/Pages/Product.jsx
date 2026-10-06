import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { getProductCardColor } from "../Components/productTheme";
import ProductImage from "../Components/ProductImage";
import ProductActions from "../Components/ProductActions";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // Filter & Search States
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Keep search in sync if URL param changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "All";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(urlSearch);
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api
      .get("/products")
      .then(({ data }) => {
        setProducts(data.products ?? []);
        setError("");
      })
      .catch(() => {
        setError("Unable to load products. Please check that the backend is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute available categories dynamically
  const categories = useMemo(() => {
    const catSet = new Set();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        catSet.add(p.category.trim());
      }
    });
    return ["All", ...Array.from(catSet)];
  }, [products]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      setSearchParams({});
    }
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("All");
    setPriceRange("all");
    setSortBy("default");
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const nameMatch = (product.name || "").toLowerCase().includes(query);
          const descMatch = (product.description || "").toLowerCase().includes(query);
          const catMatch = (product.category || "").toLowerCase().includes(query);
          if (!nameMatch && !descMatch && !catMatch) return false;
        }

        if (selectedCategory !== "All") {
          const prodCat = (product.category || "").toLowerCase().trim();
          if (prodCat !== selectedCategory.toLowerCase().trim()) return false;
        }

        if (priceRange !== "all") {
          const price = Number(product.price) || 0;
          if (priceRange === "under-500" && price >= 500) return false;
          if (priceRange === "500-2000" && (price < 500 || price > 2000)) return false;
          if (priceRange === "2000-5000" && (price < 2000 || price > 5000)) return false;
          if (priceRange === "over-5000" && price <= 5000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "All" ||
    priceRange !== "all" ||
    sortBy !== "default";

  return (
    <main className="min-h-screen bg-[#fff7d6] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Golden Mesh Header Banner - Matching Store Theme */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffe88a] via-[#e7b900] to-[#fff7d6] p-6 sm:p-10 text-[#202016] shadow-[0_20px_50px_rgb(32_32_22/12%)]">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#a48500]/25 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#202016]">✦</span>
                <p className="text-xs font-bold uppercase tracking-[.25em] text-[#514810]">
                  The Everyday Edit
                </p>
              </div>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-[#202016]">
                Made to be Discovered
              </h1>
              <p className="mt-2 max-w-lg text-xs sm:text-sm font-medium text-[#514810]">
                Explore curated fashion, lifestyle essentials, and thoughtful products tailored for everyday life.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-2xl border border-[#202016]/20 bg-white/85 px-4 py-2 text-xs font-black text-[#202016] shadow-sm backdrop-blur-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls Card */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_16px_40px_rgb(32_32_22/8%)]">
          {/* Row 1: Search Input & Submit Button */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products by name, description, or category..."
                aria-label="Search products"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-11 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#e7b900] focus:bg-white focus:ring-4 focus:ring-[#fff0a8]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setSearchParams({});
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#202016] px-8 py-3 text-xs sm:text-sm font-black text-white shadow-md transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Search</span>
              <span>→</span>
            </button>
          </form>

          {/* Row 2: Category Chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  const nextParams = {};
                  if (searchQuery.trim()) nextParams.search = searchQuery.trim();
                  if (cat !== "All") nextParams.category = cat;
                  setSearchParams(nextParams);
                }}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#202016] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-[#fff0a8] hover:text-[#202016]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Row 3: Filter Dropdowns & Reset */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Price Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="price-filter" className="font-bold text-slate-600">
                  Price:
                </label>
                <select
                  id="price-filter"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#e7b900]"
                >
                  <option value="all">All Prices</option>
                  <option value="under-500">Under ₹500</option>
                  <option value="500-2000">₹500 – ₹2,000</option>
                  <option value="2000-5000">₹2,000 – ₹5,000</option>
                  <option value="over-5000">Over ₹5,000</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-filter" className="font-bold text-slate-600">
                  Sort By:
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#e7b900]"
                >
                  <option value="default">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-xs font-bold text-rose-700 shadow-sm">
            <span className="mr-1 text-sm">⚠️</span>
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
            <span className="animate-pulse text-4xl font-black text-[#a48500]">✦</span>
            <div className="mt-4 h-9 w-9 animate-spin rounded-full border-4 border-[#202016] border-t-transparent" />
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#202016]">
              Loading Products...
            </p>
          </div>
        )}

        {/* Empty State when no products match */}
        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <span className="text-5xl">🔍</span>
            <h3 className="mt-4 text-xl font-black text-[#202016]">
              No matching products found
            </h3>
            <p className="mt-1.5 text-xs text-slate-500">
              Try adjusting your search query, selecting another category, or resetting your filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 rounded-xl bg-[#202016] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#e7b900] hover:text-[#202016] cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                style={{ backgroundColor: getProductCardColor(product) }}
                className="product-card soft-card overflow-hidden rounded-2xl p-3.5 flex flex-col justify-between border border-slate-200/60 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-[#e7b900]"
              >
                <div>
                  <Link
                    to={`/products/${product._id}`}
                    style={{ backgroundColor: getProductCardColor(product) }}
                    className="relative block overflow-hidden rounded-xl"
                  >
                    <span className="absolute top-2 left-2 z-10 rounded-md bg-[#e11d48] px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                      -18%
                    </span>
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="product-image h-48 w-full object-contain p-3 transition duration-300 hover:scale-105"
                    />
                  </Link>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="tracking-[.1em] text-[#e0ad00]">★★★★★</span>
                      <span className="text-slate-500 font-semibold">{product.rating ?? "4.8"}</span>
                    </div>
                    {product.category && (
                      <span className="rounded-lg bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-xs">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <h2 className="mb-1 mt-2 text-sm sm:text-base font-bold text-[#202016] truncate hover:text-[#a48500] transition">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mb-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                    {product.description || "Thoughtfully selected for everyday living."}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-[#202016]">
                      ₹{product.price}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{Math.round(product.price * 1.25)}
                    </span>
                  </div>
                  <ProductActions productId={product._id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Products;
