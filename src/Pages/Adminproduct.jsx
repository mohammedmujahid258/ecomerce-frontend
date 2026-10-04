
import { useEffect, useState } from "react";
import { api } from "../api";

function AdminProducts() {
  const [products, setProducts] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [name,setName]=useState("");
  const[description,setDescription]=useState("");
  const[price,setPrice]=useState("");
  const[stock,setStock]=useState("")
  const[category,setCategory]=useState("")
  const[image,setImage]=useState(null)
  const[editingProduct,setEditingProduct]=useState(null)

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

      {/* Product List */}
      {products.length === 0 ? (
        <p className="text-gray-600">
          No products found.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
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

