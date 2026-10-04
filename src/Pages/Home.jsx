import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/ecommerce-hero.jpg";
import { getProductCardColor } from "../Components/productTheme";
import ProductImage from "../Components/ProductImage";
import ProductActions from "../Components/ProductActions";

const categories = ["All products", "Fashion", "Accessories", "Lifestyle", "Best sellers"];
const promises = [["01", "Quality first", "Thoughtful products selected for everyday life."], ["02", "Easy shopping", "A simple, secure experience from start to finish."], ["03", "Made for you", "Fresh finds and considered essentials, always."]];
const testimonials = [["Aarav K.", "The quality is even better than I expected."], ["Meera S.", "My order arrived quickly and beautifully packed."], ["Riya P.", "Finally, a store that makes everyday shopping feel special."]];

function ProductTile({ product }) {
  return <Link to={`/products/${product._id}`} style={{ backgroundColor: getProductCardColor(product) }} className="group overflow-hidden rounded-2xl p-3 shadow-[0_8px_25px_rgb(32_32_22/8%)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgb(32_32_22/14%)]">
    <div style={{ backgroundColor: getProductCardColor(product) }} className="relative overflow-hidden rounded-xl">
      <ProductImage src={product.image} alt={product.name} className="product-image h-48 w-full object-contain p-4 sm:h-56" />
      <span className="absolute bottom-3 left-3 rounded-full bg-[#202016] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">View item →</span>
    </div>
    <div className="px-1 pb-1 pt-4">
      <div className="flex items-center gap-2 text-xs"><span className="tracking-[.1em] text-[#e0ad00]">★★★★★</span><span className="text-slate-500">{product.rating ?? "4.8"}</span></div>
      <h3 className="mt-2 truncate font-bold text-[#202016]">{product.name}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description || "Thoughtfully selected for everyday living."}</p>
      <p className="mt-3 font-black text-[#202016]">₹{product.price}</p>
      <ProductActions productId={product._id} />
    </div>
  </Link>;
}

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts((data.products ?? []).slice(0, 8))).catch(() => setProducts([]));
  }, []);

  return <main className="store-shell bg-[#fffdf7]">
    <div className="bg-[#202016] px-6 py-2 text-center text-[11px] font-bold uppercase tracking-[.14em] text-white">Free shipping on orders over ₹999 <span className="mx-2 text-[#e7b900]">•</span> New season, new energy</div>

    <section className="bg-[#fff7d6] px-6 py-7 sm:px-10 lg:px-16"><div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[.8fr_1.2fr]">
      <div className="order-2 py-4 lg:order-1 lg:py-10"><p className="text-xs font-black uppercase tracking-[.22em] text-[#a48500]">The everyday edit</p><h1 className="mt-4 max-w-lg text-4xl font-black uppercase leading-[.92] tracking-[-.05em] text-[#202016] sm:text-6xl">Elevate your<br /><span className="text-[#a48500]">everyday.</span></h1><p className="mt-5 max-w-md text-sm leading-6 text-[#514810] sm:text-base">Curated fashion, accessories and lifestyle essentials that bring a little more intention to every day.</p><Link to="/products" className="mt-7 inline-flex rounded-full bg-[#202016] px-6 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#e7b900] hover:text-[#202016]">Shop the collection</Link></div>
      <div className="order-1 overflow-hidden rounded-2xl border-4 border-[#202016] bg-[#f6ce25] shadow-[8px_8px_0_#202016] lg:order-2"><img src={heroImage} alt="MyStore everyday collection" className="h-64 w-full object-cover object-center sm:h-80 lg:h-[23rem]" /></div>
    </div></section>

    <section className="border-b border-[#e8d36b] bg-white px-6 py-5 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 sm:justify-between"><span className="w-full text-center text-xs font-black uppercase tracking-[.18em] text-[#202016] sm:w-auto">Shop by mood</span>{categories.map((item) => <Link to={item === "All products" ? "/products" : `/products?category=${encodeURIComponent(item)}`} key={item} className="rounded-full border border-[#d7c66e] bg-[#fffdf7] px-4 py-2 text-xs font-bold text-[#202016] transition hover:border-[#202016] hover:bg-[#202016] hover:text-white">{item}</Link>)}</div></section>

    <section className="bg-[#fff7d6] px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#a48500]">Fresh picks</p><h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#202016] sm:text-3xl">Top picks for you</h2></div><Link to="/products" className="text-xs font-black uppercase text-[#202016] underline decoration-2 underline-offset-4">See all →</Link></div>{products.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductTile key={product._id} product={product} />)}</div> : <p className="rounded-2xl bg-white p-8 text-center text-slate-600">Your collection is loading. Visit the products page to explore.</p>}</div></section>

    <section className="bg-[#fffdf7] px-6 py-10 sm:px-10 lg:px-16"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">{[["New season", "Find your next everyday favorite", "Explore now", "/products"], ["Make it yours", "Small details. Big difference.", "Shop accessories", "/products"], ["Upgrade your routine", "Essentials with a point of view.", "See the edit", "/products"]].map(([eyebrow, title, action, path]) => <Link to={path} key={title} className="rounded-2xl border border-[#e8d36b] bg-[#fff7d6] p-6 transition hover:-translate-y-1 hover:border-[#202016]"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a48500]">{eyebrow}</p><h3 className="mt-3 max-w-xs text-xl font-black leading-tight text-[#202016]">{title}</h3><span className="mt-6 inline-block text-xs font-black uppercase underline decoration-2 underline-offset-4">{action} →</span></Link>)}</div></section>

    <section className="bg-[#202016] px-6 py-12 text-white sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#e7b900]">The MyStore promise</p><h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Made for everyday living</h2></div></div><div className="grid gap-8 sm:grid-cols-3">{promises.map(([number, title, copy]) => <div key={title} className="border-t border-white/20 pt-4"><span className="text-xs font-black text-[#e7b900]">{number}</span><h3 className="mt-3 font-black uppercase">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p></div>)}</div></div></section>

    <section className="bg-[#fffdf7] px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#a48500]">Loved by thousands</p><h2 className="mt-2 text-2xl font-black uppercase text-[#202016] sm:text-3xl">Good things, said simply.</h2></div><span className="text-sm font-black tracking-wider text-[#e0ad00]">★★★★★</span></div><div className="grid gap-4 md:grid-cols-3">{testimonials.map(([name, quote]) => <article key={name} className="rounded-2xl border border-[#e8d36b] bg-white p-5"><div className="text-sm tracking-wider text-[#e0ad00]">★★★★★</div><p className="mt-4 text-sm leading-6 text-[#202016]">“{quote}”</p><p className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">{name}</p></article>)}</div></div></section>

    <section className="bg-[#e7b900] px-6 py-10 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#202016]">Stay in the loop</p><h2 className="mt-2 text-2xl font-black text-[#202016]">Fresh finds, straight to your inbox.</h2></div><Link to="/register" className="rounded-full bg-[#202016] px-6 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-[#202016]">Join MyStore</Link></div></section>
  </main>;
}

export default Home;
