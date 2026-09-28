import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data.products ?? [])).catch(() => setError("Unable to load products. Please check that the backend is running."));
  }, []);

  return <div className="store-shell px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl">
    <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-indigo-600">The collection</p><h1 className="text-4xl font-black tracking-tight text-slate-950">Made to be discovered</h1><p className="mt-2 text-slate-500">Find something special for every part of your day.</p></div><span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600">{products.length} products</span></div>
    {error && <p className="soft-card mb-6 rounded-xl p-4 text-center text-rose-600">{error}</p>}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <div key={product._id} className="product-card soft-card overflow-hidden rounded-2xl p-4"><div className="overflow-hidden rounded-xl bg-slate-50"><img src={product.image} alt={product.name} className="product-image h-56 w-full object-contain p-5" /></div><h2 className="mb-2 mt-5 text-lg font-bold text-slate-900">{product.name}</h2><p className="mb-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{product.description}</p><p className="mb-3 text-xl font-black text-indigo-600">₹{product.price}</p><p className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Stock: {product.stock}</p><Link to={`/products/${product._id}`} className="inline-block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-600">View details</Link></div>)}</div>
  </div></div>;
}

export default Products;
