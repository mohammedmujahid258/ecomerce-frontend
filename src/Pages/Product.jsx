import { useEffect, useState } from "react";

import { api } from "../api";
import { Link } from "react-router-dom";
function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Products page loaded");

    const fetchProducts = async () => {
      try {
        const response = await api.get(
          "/products"
        );

        console.log("Products response:", response.data);
        setProducts(response.data.products ?? []);
      } catch (requestError) {
        console.error("Error fetching products:", requestError);
        setError(
          "Unable to load products. Please check that the backend is running."
        );
      }
    };

    fetchProducts();
  }, []);

  return (
  <div className="min-h-screen bg-gray-100 p-6">
    <h1 className="mb-8 text-center text-3xl font-bold">
      Our Products
    </h1>

    {error && <p className="mb-4 text-center text-red-600">{error}</p>}

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        
<div
  key={product._id}
  className="rounded-xl bg-white p-6 shadow-md"
>
  <img
    src={product.image}
    alt={product.name}
              className="mb-4 h-48 w-full rounded-lg bg-gray-100 object-contain"
  />

  <h2 className="mb-2 text-xl font-bold">{product.name}
          </h2>

          <p className="mb-3 text-gray-600">
            {product.description}
          </p>

          <p className="mb-2 text-lg font-semibold text-blue-600">
            ₹{product.price}
          </p>

          <p className="mb-4 text-gray-500">
            Stock: {product.stock}
          </p>

          <Link
  to={`/products/${product._id}`}
  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">
  View Details
     </Link>
        </div>
      ))}
    </div>
  </div>
);
}

export default Products;
