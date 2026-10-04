import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { getProductCardColor } from "../Components/productTheme";
import ProductImage from "../Components/ProductImage";

function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data.products ?? [])).catch(() => setError("Unable to load products. Please check that the backend is running."));
  }, []);

  return <div className="products-page px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl">
    <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-[#a48500]">The collection</p><h1 className="text-4xl font-black tracking-tight text-[#202016]">Made to be discovered</h1><p className="mt-2 text-slate-500">Find something special for every part of your day.</p></div><span className="rounded-full bg-[#f5f5f1] px-4 py-2 text-sm font-bold text-[#202016]">{products.length} products</span></div>
    {error && <p className="soft-card mb-6 rounded-xl p-4 text-center text-rose-600">{error}</p>}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <div key={product._id} style={{ backgroundColor: getProductCardColor(product) }} className="product-card soft-card overflow-hidden rounded-2xl p-3"><div style={{ backgroundColor: getProductCardColor(product) }} className="overflow-hidden rounded-xl"><ProductImage src={product.image} alt={product.name} className="product-image h-48 w-full object-contain p-3" /></div><div className="mt-3 flex items-center gap-2 text-xs"><span className="tracking-[.1em] text-[#e0ad00]">★★★★★</span><span className="text-slate-500">{product.rating ?? "4.8"}</span></div><h2 className="mb-2 mt-2 text-base font-bold text-slate-900">{product.name}</h2><p className="mb-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{product.description || "Thoughtfully selected for everyday living."}</p><p className="mb-3 text-lg font-black text-indigo-600">₹{product.price}</p><Link to={`/products/${product._id}`} className="inline-block w-full rounded-xl bg-slate-900 px-3 py-2.5 text-center text-xs font-bold text-white transition hover:bg-indigo-600">View details</Link></div>)}</div>
  </div></div>;
}

export default Products;
