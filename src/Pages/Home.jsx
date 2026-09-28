import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const suggestions = ["New arrivals", "Everyday essentials", "Best sellers", "Accessories"];

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts((data.products ?? []).slice(0, 8))).catch(() => setProducts([]));
  }, []);

  return (
    <main className="store-shell bg-white">
      <div className="bg-slate-900 px-6 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">Free shipping on orders over ₹999 <span className="mx-2 text-indigo-300">•</span> Shop the latest collection today</div>
      <section className="px-6 pb-20 pt-20 sm:px-10 sm:pt-28 lg:px-16 lg:pt-36">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-8 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900"><span className="text-indigo-600">M</span><span>MyStore</span></div>
          <h1 className="max-w-3xl text-4xl font-normal leading-tight tracking-tight text-slate-900 sm:text-6xl">Everything you need, <span className="font-semibold text-indigo-600">beautifully found.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">Discover thoughtfully selected products for your everyday life, all in one simple place.</p>
          <Link to="/products" className="search-shell mt-10 flex w-full max-w-2xl items-center gap-4 rounded-full border border-slate-200 bg-white px-5 py-4 text-left transition"><span className="text-xl text-slate-400">⌕</span><span className="flex-1 text-sm text-slate-400 sm:text-base">What are you looking for today?</span><span className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white">Search</span></Link>
          <div className="mt-7 flex flex-wrap justify-center gap-3">{suggestions.map((item) => <Link key={item} to="/products" className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600">{item}</Link>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-100 px-6 py-5 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3"><span className="mr-2 text-sm font-bold text-slate-900">Shop by category</span>{["All products", "New arrivals", "Fashion", "Accessories", "Lifestyle", "Best sellers"].map((item, index) => <Link key={item} to="/products" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${index === 0 ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}>{item}</Link>)}</div></section>

      <section className="px-6 py-16 sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Handpicked for you</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Explore the collection</h2><p className="mt-2 text-slate-500">A few favorites to get you started.</p></div><Link to="/products" className="hidden text-sm font-semibold text-indigo-600 sm:block">View all -&gt;</Link></div>
        {products.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <Link to={`/products/${product._id}`} key={product._id} className="product-card soft-card overflow-hidden rounded-2xl p-3"><div className="overflow-hidden rounded-xl bg-slate-50"><img src={product.image} alt={product.name} className="product-image h-48 w-full object-contain p-4" /></div><div className="p-2 pt-4"><h3 className="truncate font-bold text-slate-900">{product.name}</h3><p className="mt-2 font-black text-indigo-600">₹{product.price}</p><p className="mt-1 text-xs text-slate-400">{product.stock} available</p></div></Link>)}</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{["New arrivals", "Daily essentials", "Accessories", "Best sellers"].map((title, index) => <Link to="/products" key={title} className="group rounded-2xl bg-slate-100 p-6 transition hover:-translate-y-1"><div className="flex h-40 items-center justify-center rounded-xl bg-white text-3xl font-black text-indigo-200">0{index + 1}</div><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">Explore the collection -&gt;</p></Link>)}</div>}
      </div></section>

      <section className="border-y border-slate-100 bg-slate-50/70 px-6 py-14 sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Explore</p><h2 className="mt-2 text-2xl font-semibold text-slate-900">Popular right now</h2></div><Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">See all products -&gt;</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["01", "New arrivals", "Fresh picks for you", "bg-indigo-100"], ["02", "Daily essentials", "Made for every day", "bg-amber-100"], ["03", "Accessories", "The details matter", "bg-rose-100"], ["04", "Best sellers", "Loved by shoppers", "bg-emerald-100"]].map(([number, title, copy, color]) => <Link key={title} to="/products" className={`group rounded-2xl ${color} p-6 transition hover:-translate-y-1 hover:shadow-lg`}><span className="text-xs font-bold text-slate-500">{number}</span><div className="mt-12"><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-600">{copy}</p><span className="mt-4 inline-block text-sm font-bold text-slate-900 transition group-hover:translate-x-1">Explore -&gt;</span></div></Link>)}</div></div></section>

      <section className="px-6 py-16 sm:px-10 lg:px-16"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">{[["Simple by design", "Find what you want without the noise."], ["Picked with care", "Quality products selected for real life."], ["Here when you need us", "A smoother way to shop, from start to finish."]].map(([title, copy]) => <div key={title}><div className="mb-4 h-1 w-10 rounded-full bg-indigo-600" /><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></div>)}</div></section>

      <section className="px-6 pb-20 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl bg-indigo-600 px-8 py-10 text-center text-white sm:flex-row sm:text-left"><div><h2 className="text-2xl font-bold">Ready to find your next favorite?</h2><p className="mt-2 text-indigo-100">Browse the collection and make it yours.</p></div><Link to="/products" className="rounded-full bg-white px-6 py-3 font-bold text-indigo-600 transition hover:bg-indigo-50">Shop now -&gt;</Link></div></section>
    </main>
  );
}

export default Home;
