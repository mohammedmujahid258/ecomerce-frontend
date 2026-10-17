import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import AdminLayout from "../Components/AdminLayout";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data?.products ?? []);
    } catch (error) {
      console.error("Error fetching products:", error);
      notifyToast("Failed to fetch product catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/products")
      .then((res) => {
        if (isMounted) setProducts(res.data?.products ?? []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        if (isMounted) notifyToast("Failed to fetch product catalog", "error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique categories dynamically from actual products
  const categoriesList = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        cats.add(p.category.trim().toLowerCase());
      }
    });
    return Array.from(cats);
  }, [products]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notifyToast("Image size must be less than 5MB", "warning");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("10");
    setCategory("");
    setImage(null);
    setImagePreview("");
    setFormError("");
    setIsAddingProduct(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || "");
    setDescription(prod.description || "");
    setPrice(prod.price !== undefined ? String(prod.price) : "");
    setStock(prod.stock !== undefined ? String(prod.stock) : "0");
    setCategory(prod.category || "");
    setImage(null);
    setImagePreview(prod.image || "");
    setFormError("");
  };

  const handleCloseModal = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setFormError("");
  };

  const validateForm = () => {
    if (!name.trim()) {
      setFormError("Product name is required.");
      return false;
    }
    const numPrice = Number(price);
    if (price === "" || isNaN(numPrice) || numPrice < 0) {
      setFormError("Please provide a valid non-negative price.");
      return false;
    }
    const numStock = Number(stock);
    if (stock === "" || isNaN(numStock) || numStock < 0) {
      setFormError("Please provide a valid non-negative stock count.");
      return false;
    }
    if (!category.trim()) {
      setFormError("Product category is required.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", String(price));
      formData.append("stock", String(stock || 0));
      formData.append("category", category.trim().toLowerCase());
      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/products", formData);
      const newProd = response.data?.product;
      if (newProd) {
        setProducts((prev) => [newProd, ...prev]);
      } else {
        await fetchProducts();
      }
      setIsAddingProduct(false);
      notifyToast(`Product "${name}" published successfully!`, "success");
    } catch (error) {
      console.error("Error creating product:", error);
      const msg = error.response?.data?.message || "Failed to create product listing.";
      setFormError(msg);
      notifyToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("category", category.trim().toLowerCase());
      if (image) {
        formData.append("image", image);
      }

      const response = await api.put(`/products/${editingProduct._id}`, formData);
      const updatedProd = response.data?.product;

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? updatedProd || { ...p, name, price, stock, category, description } : p))
      );
      setEditingProduct(null);
      notifyToast(`"${name}" updated successfully`, "success");
    } catch (error) {
      console.error("Error updating product:", error);
      const msg = error.response?.data?.message || "Failed to update product.";
      setFormError(msg);
      notifyToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;

    const prodId = deletingProduct._id;
    const prodName = deletingProduct.name;

    try {
      await api.delete(`/products/${prodId}`);
      setProducts((prev) => prev.filter((p) => p._id !== prodId));
      notifyToast(`"${prodName}" deleted from catalog`, "info");
      setDeletingProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      notifyToast(error.response?.data?.message || "Failed to delete product.", "error");
    }
  };

  // Filter & Sort
  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || "").toLowerCase().includes(q);
        const matchesCat = (p.category || "").toLowerCase().includes(q);
        const matchesDesc = (p.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }
      // Category filter
      if (selectedCategory !== "all") {
        if ((p.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.price || 0) - Number(b.price || 0);
        case "price-desc":
          return Number(b.price || 0) - Number(a.price || 0);
        case "stock-asc":
          return Number(a.stock || 0) - Number(b.stock || 0);
        case "stock-desc":
          return Number(b.stock || 0) - Number(a.stock || 0);
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <AdminLayout
      title="Product Catalog & Stock"
      subtitle="Search, modify unit prices, update inventory quantities, and upload photography"
      breadcrumbs={["Products"]}
      actions={
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition cursor-pointer"
        >
          <span>+</span>
          <span>New Product</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search, Filter & Sort Controls */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by title, category, or spec..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category and Sort Options */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-stone-900 cursor-pointer capitalize"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-stone-900 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock-asc">Stock: Lowest First</option>
                  <option value="stock-desc">Stock: Highest First</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results summary bar */}
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing <strong className="text-stone-900">{processedProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> catalog items
            </span>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="font-semibold text-stone-700 hover:text-stone-900 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Catalog Table */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Retrieving catalog records..." />
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl text-stone-500 mb-3">
              📦
            </div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              No products found
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search query or category filter."
                : "No products exist in your catalog yet. Click '+ New Product' to list your first item."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-stone-200/90 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/80 font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock Availability</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {processedProducts.map((p) => {
                  const stockNum = p.stock ?? 0;
                  const isOutOfStock = stockNum <= 0;
                  const isLowStock = stockNum > 0 && stockNum <= 5;

                  return (
                    <tr key={p._id} className="hover:bg-stone-50/50 transition">
                      {/* Product Name & Visual */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 p-1">
                            <ProductImage
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <Link
                              to={`/products/${p._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-stone-900 hover:text-stone-600 transition truncate block"
                              title={p.name}
                            >
                              {p.name}
                            </Link>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-400">
                              {p.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 capitalize">
                          {p.category || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-stone-900 text-sm">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Low: {stockNum} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {stockNum} units
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Product Modal */}
        {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-lg rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 my-8">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <div>
                  <h2 className="font-editorial text-xl font-bold text-stone-900">
                    {isAddingProduct ? "Add New Catalog Product" : `Edit Listing: ${name}`}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Enter product attributes, pricing, inventory stock, and photography
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <form
                onSubmit={isAddingProduct ? handleAddProduct : handleUpdateProduct}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Minimalist Linen Shirt"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 2499"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. apparel, electronics, accessories, home"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe material composition, sizing, features, and specs..."
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Product Image (Photo Upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                  />

                  {imagePreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-stone-200 p-1 bg-stone-50">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {image ? `New upload: ${image.name}` : "Current catalog photo"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-2xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting
                      ? "Saving..."
                      : isAddingProduct
                      ? "Publish Product"
                      : "Save Modifications"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 text-xl mb-4">
                ⚠️
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Delete Product Listing?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Are you sure you want to permanently remove{" "}
                <strong className="text-stone-900">"{deletingProduct.name}"</strong>? This will
                delete the item from your public storefront and cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="rounded-2xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
