import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductImage from "../Components/ProductImage";
import LoadingSpinner from "../Components/LoadingSkeleton";
import { notifyToast } from "../utils/cartWishlistEvents";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setStock("");
    setCategory("");
    setImage(null);
    setImagePreview("");
    setIsAddingProduct(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || "");
    setDescription(prod.description || "");
    setPrice(prod.price || "");
    setStock(prod.stock || 0);
    setCategory(prod.category || "");
    setImage(null);
    setImagePreview(prod.image || "");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !category.trim()) {
      notifyToast("Please fill in required fields (Name, Price, Category)", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("stock", stock || 0);
      formData.append("category", category.trim());
      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/products", formData);
      const newProd = response.data?.product;
      if (newProd) {
        setProducts((prev) => [newProd, ...prev]);
      }
      setIsAddingProduct(false);
      notifyToast(`Product "${name}" created successfully!`, "success");
    } catch (error) {
      console.error("Error creating product:", error);
      notifyToast(error.response?.data?.message || "Error creating product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category.trim());
      if (image) {
        formData.append("image", image);
      }

      const response = await api.put(`/products/${editingProduct._id}`, formData);
      const updatedProd = response.data?.product;

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? updatedProd || p : p))
      );
      setEditingProduct(null);
      notifyToast("Product updated successfully", "success");
    } catch (error) {
      console.error("Error updating product:", error);
      notifyToast(error.response?.data?.message || "Error updating product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, prodName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      notifyToast(`Product deleted successfully`, "info");
    } catch (error) {
      console.error("Error deleting product:", error);
      notifyToast(error.response?.data?.message || "Error deleting product", "error");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50/70 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Link to="/admin" className="hover:text-slate-900">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-900">Manage Products</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Product Inventory Catalog
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Total {products.length} catalog items managed in store database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              &larr; Admin Home
            </Link>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 cursor-pointer"
            >
              + Add New Product
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              🔍
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingSpinner message="Loading catalog..." />
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No products match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const inStock = (p.stock ?? 0) > 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <ProductImage
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <Link
                              to={`/products/${p._id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition"
                            >
                              {p.name}
                            </Link>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400 max-w-xs">
                              {p.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 capitalize">
                          {p.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        {inStock ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {p.stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="rounded-lg border border-rose-200 px-2.5 py-1 font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
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

        {/* Modal: Add or Edit Product */}
        {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  {isAddingProduct ? "Add New Product" : `Edit "${name}"`}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={isAddingProduct ? handleAddProduct : handleUpdateProduct}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 2999"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stock Inventory *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. electronics, mobile, fabric, shoes"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe product highlights, specs, and materials..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Image (Photo Upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {imagePreview && (
                    <div className="mt-2 h-20 w-20 overflow-hidden rounded-xl border border-slate-200 p-1 bg-slate-50">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : isAddingProduct ? "Create Product" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
