import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductGrid from "../Components/ProductGrid";

const ITEMS_PER_PAGE = 8;

// Friendly category label mapping for known catalog departments
const categoryLabels = {
  all: "All",
  mobile: "Smartphones & Mobile",
  electronics: "Electronics & Tech",
  "electronic device": "Audio & Devices",
  fabric: "Apparel & Fabric",
  shoes: "Footwear & Shoes",
  glass: "Eyewear & Accessories",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";

  // Filter & Search States
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setSearchInput(searchQuery);
  }

  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const loadProducts = () => {
    setLoading(true);
    setError("");
    api
      .get("/products")
      .then(({ data }) => {
        setProducts(data.products ?? []);
      })
      .catch((err) => {
        console.error("Failed to load products catalog:", err);
        setError("Unable to load product catalog. Please ensure your connection is active and try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/products")
      .then(({ data }) => {
        if (!isMounted) return;
        setProducts(data.products ?? []);
      })
      .catch((err) => {
        console.error("Failed to load products catalog:", err);
        if (isMounted) {
          setError("Unable to load product catalog. Please ensure your connection is active and try again.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available categories dynamically from existing products
  const availableCategories = useMemo(() => {
    const catSet = new Set();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        catSet.add(p.category.trim().toLowerCase());
      }
    });
    return ["all", ...Array.from(catSet)];
  }, [products]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setVisibleCount(ITEMS_PER_PAGE);

    const nextParams = {};
    if (trimmed) nextParams.search = trimmed;
    if (selectedCategory !== "all") nextParams.category = selectedCategory;
    setSearchParams(nextParams);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput("");
    setPriceRange("all");
    setInStockOnly(false);
    setSortBy("default");
    setVisibleCount(ITEMS_PER_PAGE);
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Text Query Search (name, description, category)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = (product.name || "").toLowerCase().includes(q);
          const descMatch = (product.description || "").toLowerCase().includes(q);
          const catMatch = (product.category || "").toLowerCase().includes(q);
          if (!nameMatch && !descMatch && !catMatch) return false;
        }

        // 2. Category Filter (case-insensitive substring match)
        if (selectedCategory !== "all" && selectedCategory !== "All") {
          const prodCat = (product.category || "").toLowerCase().trim();
          const filterCat = selectedCategory.toLowerCase().trim();
          if (!prodCat.includes(filterCat) && !filterCat.includes(prodCat)) {
            return false;
          }
        }

        // 3. In-Stock Filter
        if (inStockOnly && (Number(product.stock) || 0) <= 0) {
          return false;
        }

        // 4. Price Range Filter
        if (priceRange !== "all") {
          const price = Number(product.price) || 0;
          if (priceRange === "under-1000" && price >= 1000) return false;
          if (priceRange === "1000-5000" && (price < 1000 || price > 5000)) return false;
          if (priceRange === "5000-20000" && (price < 5000 || price > 20000)) return false;
          if (priceRange === "over-20000" && price <= 20000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === "rating") return (Number(b.rating) || 4.8) - (Number(a.rating) || 4.8);
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, priceRange, inStockOnly, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    (selectedCategory !== "all" && selectedCategory !== "All") ||
    priceRange !== "all" ||
    inStockOnly ||
    sortBy !== "default";

  const paginatedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const currentCategoryLabel =
    categoryLabels[selectedCategory.toLowerCase()] ||
    (selectedCategory !== "all" ? selectedCategory : "All Products");

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-stone-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-stone-900 transition">
            Shop
          </Link>
          {selectedCategory !== "all" && (
            <>
              <span>/</span>
              <span className="font-semibold text-stone-900 capitalize">
                {currentCategoryLabel}
              </span>
            </>
          )}
        </nav>

        {/* Editorial Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Curated Catalog
            </span>
            <h1 className="mt-1 font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900">
              {selectedCategory !== "all" ? currentCategoryLabel : "All Products"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-xl">
              Thoughtfully selected essentials for modern living, verified for authenticity and crafted for daily durability.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-block rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-semibold text-stone-700 shadow-2xs">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"} Available
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-xs">
          {/* Row 1: Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products by title, category, or description..."
                aria-label="Search catalog"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-800 placeholder-stone-400 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-100"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchParams(selectedCategory !== "all" ? { category: selectedCategory } : {});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Row 2: Category Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mr-1">
              Departments:
            </span>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              const label = categoryLabels[cat] || cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setVisibleCount(ITEMS_PER_PAGE);
                    const nextParams = {};
                    if (searchQuery.trim()) nextParams.search = searchQuery.trim();
                    if (cat !== "all") nextParams.category = cat;
                    setSearchParams(nextParams);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Row 3: Dropdowns, Stock Toggle & Reset Filters */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Price Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="price-filter" className="font-semibold text-stone-600">
                  Price:
                </label>
                <select
                  id="price-filter"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(e.target.value);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-stone-400 cursor-pointer"
                >
                  <option value="all">All Prices</option>
                  <option value="under-1000">Under ₹1,000</option>
                  <option value="1000-5000">₹1,000 – ₹5,000</option>
                  <option value="5000-20000">₹5,000 – ₹20,000</option>
                  <option value="over-20000">Over ₹20,000</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-filter" className="font-semibold text-stone-600">
                  Sort:
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-stone-400 cursor-pointer"
                >
                  <option value="default">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Alphabetical (A-Z)</option>
                </select>
              </div>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 h-4 w-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Product Grid with Loading, Empty & Error States */}
        <ProductGrid
          products={paginatedProducts}
          loading={loading}
          error={error}
          onRetry={loadProducts}
          emptyTitle="No matching products found"
          emptyDescription="We couldn't find any items matching your active search or filters. Try adjusting your query or resetting your criteria."
          emptyActionLabel="Reset All Filters"
          onEmptyAction={handleResetFilters}
        />

        {/* Load More Pagination */}
        {!loading && !error && hasMore && (
          <div className="mt-12 flex flex-col items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="rounded-full border border-stone-300 bg-white px-8 py-3 text-xs sm:text-sm font-semibold text-stone-900 shadow-xs transition hover:bg-stone-50 hover:border-stone-400 active:scale-95 cursor-pointer"
            >
              Load More Products ({filteredProducts.length - visibleCount} remaining)
            </button>
            <p className="text-[11px] text-stone-400">
              Showing {visibleCount} of {filteredProducts.length} items
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
