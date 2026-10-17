import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../Components/ProductCard";
import { ProductGridSkeleton } from "../Components/LoadingSkeleton";
import EmptyState from "../Components/EmptyState";
import ErrorState from "../Components/ErrorState";

const ITEMS_PER_PAGE = 8;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";

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

  const fetchCatalog = () => {
    api
      .get("/products")
      .then(({ data }) => {
        setProducts(data.products ?? []);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setError("Unable to load product catalog. Please ensure the server is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Compute available categories dynamically from existing products
  const availableCategories = useMemo(() => {
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
    setVisibleCount(ITEMS_PER_PAGE);

    const nextParams = {};
    if (trimmed) nextParams.search = trimmed;
    if (selectedCategory !== "All") nextParams.category = selectedCategory;
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

        // 2. Category Filter
        if (selectedCategory !== "All") {
          const prodCat = (product.category || "").toLowerCase().trim();
          if (prodCat !== selectedCategory.toLowerCase().trim()) return false;
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
    selectedCategory !== "All" ||
    priceRange !== "all" ||
    inStockOnly ||
    sortBy !== "default";

  const paginatedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Title & Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Products</span>
            {selectedCategory !== "All" && (
              <>
                <span>/</span>
                <span className="capitalize font-semibold text-blue-600">{selectedCategory}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {selectedCategory !== "All" ? `${selectedCategory} Collection` : "All Products"}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Showing {filteredProducts.length} verified {filteredProducts.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          {/* Row 1: Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products by title, category, or description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchParams(selectedCategory !== "All" ? { category: selectedCategory } : {});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 sm:px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 cursor-pointer active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Row 2: Category Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setVisibleCount(ITEMS_PER_PAGE);
                    const nextParams = {};
                    if (searchQuery.trim()) nextParams.search = searchQuery.trim();
                    if (cat !== "All") nextParams.category = cat;
                    setSearchParams(nextParams);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Row 3: Dropdowns, Stock Toggle & Reset */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Price Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="price-filter" className="font-semibold text-slate-600">
                  Price:
                </label>
                <select
                  id="price-filter"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(e.target.value);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 cursor-pointer"
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
                <label htmlFor="sort-filter" className="font-semibold text-slate-600">
                  Sort by:
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 cursor-pointer"
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
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>✕</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <ErrorState message={error} onRetry={fetchCatalog} />
          </div>
        )}

        {/* Loading State */}
        {loading && <ProductGridSkeleton count={8} />}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <EmptyState
            title="No matching products found"
            description="We couldn't find any items matching your active search or filters. Try adjusting your search term or resetting your filter criteria."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                  className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-xs sm:text-sm font-bold text-slate-900 shadow-xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-95 cursor-pointer"
                >
                  Load More Products ({filteredProducts.length - visibleCount} remaining)
                </button>
                <p className="text-[11px] text-slate-400">
                  Showing {visibleCount} of {filteredProducts.length} items
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
