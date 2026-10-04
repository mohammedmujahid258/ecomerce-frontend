
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [name,setName]=useState("");
  const[description,setDescription]=useState("");
  const[price,setPrice]=useState("");
  const[stock,setStock]=useState("")
  const[category,setCategory]=useState("")
  const[image,setImage]=useState(null)
  const[editingProduct,setEditingProduct]=useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        console.log("Admin products:", response.data);

        setProducts(response.data.products);
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(products)) return ["all"];
    const cats = new Set();
    products.forEach((p) => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return ["all", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products
      .filter((product) => {
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const nameMatch = (product.name || "").toLowerCase().includes(query);
          const descMatch = (product.description || "").toLowerCase().includes(query);
          const catMatch = (product.category || "").toLowerCase().includes(query);
          if (!nameMatch && !descMatch && !catMatch) return false;
        }

        if (selectedCategory !== "all") {
          const cat = (product.category || "").toLowerCase().trim();
          if (cat !== selectedCategory.toLowerCase().trim()) return false;
        }

        if (stockFilter === "in-stock" && (Number(product.stock) || 0) <= 0) return false;
        if (stockFilter === "low-stock" && ((Number(product.stock) || 0) <= 0 || (Number(product.stock) || 0) > 5)) return false;
        if (stockFilter === "out-of-stock" && (Number(product.stock) || 0) > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === "stock-low") return (Number(a.stock) || 0) - (Number(b.stock) || 0);
        if (sortBy === "stock-high") return (Number(b.stock) || 0) - (Number(a.stock) || 0);
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedCategory !== "all" ||
    stockFilter !== "all" ||
    sortBy !== "default";
  const handleAddProduct=async()=>{
    try{
      const formData=new FormData();
      formData.append("name",name);
      formData.append("description",description);
      formData.append("price",price);
      formData.append("stock",stock);
      formData.append("category",category);
      formData.append("image",image)




      const response=await api.post("/products",formData)
      console.log("Product created :",response.data);

      setProducts((peviousProducts)=>[
        ...peviousProducts,
        response.data.product,
      ]);
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategory("");
      setImage(null)
      setIsAddingProduct(false);


    }
    catch(error){
      console.log("Error creating products", error)
    }
  }

  const handleUpdateProduct=async()=>{
    try{
      const formData = new FormData();
      formData.append("name", editingProduct.name);
      formData.append("description", editingProduct.description);
      formData.append("price", editingProduct.price);
      formData.append("stock", editingProduct.stock);
      formData.append("category", editingProduct.category);

      if (image) {
        formData.append("image", image);
      }

      const response=await api.put(
        `/products/${editingProduct._id}`,
        formData
      );
      console.log("product update :",response.data);

      setProducts((previousProduct)=>
        previousProduct.map((product)=>
        product._id===editingProduct._id
      ? response.data.product
    :product)

      )
       setEditingProduct(null)
       setImage(null)

    }catch(error){
      console.log("Error updating product:",error)
    }
   
  }

  const handleDeleteProduct=async(productId)=>{
    try{

      const response=await api.delete(`/products/${productId}`);
      console.log("Product deleted :",response.data);
      setProducts((previousProduct)=>
      previousProduct.filter((product)=>product._id!==productId))

    }catch(error){
      console.log("Error deleting product:",error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Manage Products
        </h1>

        <button
          onClick={() => setIsAddingProduct(true)}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {/* Add Product Section */}
      {(isAddingProduct || editingProduct) && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Add Product
          </h2>

          <div className="space-y-4">
            {editingProduct && (
  <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold text-gray-800">
      Edit Product
    </h2>

    <div className="space-y-4">

      <input
        type="text"
        value={editingProduct.name}
        onChange={(e) =>
          setEditingProduct({
            ...editingProduct,
            name: e.target.value,
          })
        }
        className="w-full rounded-lg border px-4 py-3"
      />

      <textarea
        value={editingProduct.description}
        onChange={(e) =>
          setEditingProduct({
            ...editingProduct,
            description: e.target.value,
          })
        }
        className="w-full rounded-lg border px-4 py-3"
        rows="4"
      />

      <input
        type="number"
        value={editingProduct.price}
        onChange={(e) =>
          setEditingProduct({
            ...editingProduct,
            price: e.target.value,
          })
        }
        className="w-full rounded-lg border px-4 py-3"
      />

      <input
        type="number"
        value={editingProduct.stock}
        onChange={(e) =>
          setEditingProduct({
            ...editingProduct,
            stock: e.target.value,
          })
        }
        className="w-full rounded-lg border px-4 py-3"
      />

      <input
        type="text"
        value={editingProduct.category}
        onChange={(e) =>
          setEditingProduct({
            ...editingProduct,
            category: e.target.value,
          })
        }
        className="w-full rounded-lg border px-4 py-3"
      />
      <input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
    className="w-full rounded-lg border px-4 py-3"
/>

      <button
        type="button"
        onClick={handleUpdateProduct}
        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Update Product
      </button>

      <button
        type="button"
        onClick={() => setEditingProduct(null)}
        className="ml-3 rounded-lg bg-gray-600 px-5 py-3 font-semibold text-white hover:bg-gray-700"
      >
        Cancel
      </button>

    </div>
  </div>
)}

 <input
  type="text"
  placeholder="Product Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full rounded-lg border px-4 py-3"
/>

  <textarea
  placeholder="Product Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="w-full rounded-lg border px-4 py-3"
  rows="4"
/>

<input
  type="number"
  placeholder="Price"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  className="w-full rounded-lg border px-4 py-3"
/>

  <input
  type="number"
  placeholder="Stock"
  value={stock}
  onChange={(e) => setStock(e.target.value)}
  className="w-full rounded-lg border px-4 py-3"
/>
<input
  type="text"
  placeholder="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full rounded-lg border px-4 py-3"
/>
<input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
  className="w-full rounded-lg border px-4 py-3"
/>
  <button
    type="button"
    onClick={handleAddProduct}
    className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
  >
    Save Product
  </button>

</div>

          <button
            onClick={() => setIsAddingProduct(false)}
            className="mt-5 rounded-lg bg-gray-600 px-5 py-2 text-white hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, description, or category..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Results Badge */}
          <span className="text-xs font-semibold text-gray-600">
            Showing <strong className="text-gray-900">{filteredProducts.length}</strong> of {products.length} products
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="admin-cat-filter" className="font-bold text-gray-600">
                Category:
              </label>
              <select
                id="admin-cat-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-semibold text-gray-700 outline-none focus:border-amber-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="admin-stock-filter" className="font-bold text-gray-600">
                Stock:
              </label>
              <select
                id="admin-stock-filter"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-semibold text-gray-700 outline-none focus:border-amber-400"
              >
                <option value="all">All Stock Status</option>
                <option value="in-stock">In Stock (&gt; 0)</option>
                <option value="low-stock">Low Stock (≤ 5)</option>
                <option value="out-of-stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="admin-sort-filter" className="font-bold text-gray-600">
                Sort By:
              </label>
              <select
                id="admin-sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-semibold text-gray-700 outline-none focus:border-amber-400"
              >
                <option value="default">Default / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock-low">Stock: Low to High</option>
                <option value="stock-high">Stock: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setStockFilter("all");
                setSortBy("default");
              }}
              className="font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>✕</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">
          No products found matching filters.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="rounded-xl bg-white p-5 shadow-md"
            >
              <img
                src={product.image}
                alt={product.name}
                className="mb-4 h-48 w-full rounded-lg bg-gray-100 object-contain"
              />

              <h2 className="text-xl font-bold text-gray-800">
                {product.name}
              </h2>

              <p className="mt-2 text-gray-600">
                ₹{product.price}
              </p>

              <p className="mt-1 text-gray-600">
                Stock: {product.stock}
              </p>

              <p className="mt-1 text-gray-600">
                Category: {product.category}
              </p>
              <button
               onClick={() => {
                 setEditingProduct({ ...product });
                 setImage(null);
               }}
             className="mt-4 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white hover:bg-yellow-600"
              >
            Edit
            </button>

            <button
            onClick={() => handleDeleteProduct(product._id)}
               className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
>
  Delete
</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default AdminProducts;

