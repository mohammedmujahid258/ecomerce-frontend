import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/ecommerce-hero.jpg";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts((data.products ?? []).slice(0, 8))).catch(() => setProducts([]));
  }, []);

  return <main className="store-shell bg-[#fffdf7]">
    <div className="bg-[#202016] px-6 py-2 text-center text-xs font-bold tracking-wide text-white">FREE SHIPPING ON ORDERS OVER ₹999 <span className="mx-3 text-yellow-300">•</span> NEW SEASON, NEW ENERGY</div>
    <section className="overflow-hidden bg-[#e7b900] px-6 py-8 sm:px-10 lg:px-16 lg:py-12"><div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
      <div className="z-10 py-8 lg:py-16"><p className="mb-5 text-sm font-black uppercase tracking-[.25em] text-[#443900]">The everyday edit</p><h1 className="max-w-xl text-5xl font-black uppercase leading-[.9] tracking-[-.06em] text-[#201f13] sm:text-7xl">Wear your<br /><span className="text-white">own story.</span></h1><p className="mt-7 max-w-md text-base font-medium leading-7 text-[#514810]">Curated fashion, accessories and lifestyle essentials for the way you live now.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/products" className="rounded-full bg-[#202016] px-7 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-[#202016]">Shop collection</Link><Link to="/products" className="rounded-full border-2 border-[#202016] px-7 py-3.5 text-sm font-black uppercase tracking-wide text-[#202016] transition hover:bg-white">Explore now</Link></div></div>
      <div className="hero-art relative"><div className="absolute -inset-4 rounded-[2rem] bg-yellow-200/60 blur-2xl" /><div className="relative overflow-hidden rounded-[1.5rem] border-8 border-[#202016] bg-[#f6ce25] shadow-[14px_14px_0_#202016]"><img src={heroImage} alt="Fashion and lifestyle collection" className="h-[32rem] w-full object-cover object-center sm:h-[38rem]" /><div className="absolute bottom-5 left-5 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-[#202016]">Scroll to discover ↓</div></div></div>
    </div></section>

    <section className="border-b-2 border-[#202016] bg-[#fffdf7] px-6 py-5 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 sm:justify-between"><span className="text-sm font-black uppercase tracking-wider text-[#202016]">Shop your mood</span>{["All products", "Fashion", "Accessories", "Lifestyle", "Best sellers"].map((item) => <Link to="/products" key={item} className="rounded-full border border-[#202016] px-4 py-2 text-xs font-bold text-[#202016] transition hover:bg-[#202016] hover:text-white">{item}</Link>)}</div></section>

    <section className="px-6 py-16 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-9 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-[#a48500]">Fresh picks</p><h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#202016] sm:text-4xl">The collection</h2></div><Link to="/products" className="text-sm font-black uppercase text-[#202016] underline decoration-2 underline-offset-4">View all →</Link></div>{products.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <Link to={`/products/${product._id}`} key={product._id} className="product-card group"><div className="relative overflow-hidden rounded-2xl bg-[#f1ead2]"><img src={product.image} alt={product.name} className="product-image h-64 w-full object-contain p-5" /><span className="absolute bottom-3 left-3 rounded-full bg-[#202016] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">View product →</span></div><div className="pt-4"><h3 className="truncate font-bold text-[#202016]">{product.name}</h3><div className="mt-2 flex items-center justify-between"><p className="font-black text-[#202016]">₹{product.price}</p><span className="text-xs font-bold uppercase text-slate-400 transition group-hover:text-[#a48500]">Open product →</span></div></div></Link>)}</div> : <p className="rounded-2xl bg-[#f1ead2] p-8 text-center text-slate-600">Your collection is loading. Visit the products page to explore.</p>}</div></section>

    <section className="bg-[#202016] px-6 py-14 text-white sm:px-10 lg:px-16"><div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">{[["01", "Made to stand out", "Bold pieces with an everyday point of view."], ["02", "Easy from start to finish", "A smooth shopping experience, every time."], ["03", "Find your next favorite", "Fresh products added for every kind of you."]].map(([number, title, copy]) => <div key={title}><span className="text-sm font-black text-yellow-300">{number}</span><h3 className="mt-4 text-lg font-black uppercase">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p></div>)}</div></section>
  </main>;
}

export default Home;
