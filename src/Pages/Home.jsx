import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/ecommerce-hero.jpg";
import { getProductCardColor } from "../Components/productTheme";
import ProductImage from "../Components/ProductImage";
import ProductActions from "../Components/ProductActions";

const categoryItems = [
  {
    name: "Electronics",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    name: "Fashion",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    name: "Home & Living",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Beauty",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </svg>
    ),
  },
  {
    name: "Sports",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93 19.07 19.07" />
        <path d="m14 2 5.5 5.5" />
        <path d="m4.5 14.5 5.5 5.5" />
      </svg>
    ),
  },
  {
    name: "Toys & Kids",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7" />
        <circle cx="7" cy="5" r="2.5" />
        <circle cx="17" cy="5" r="2.5" />
        <circle cx="10" cy="11" r=".5" fill="currentColor" />
        <circle cx="14" cy="11" r=".5" fill="currentColor" />
        <path d="M10 15a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    name: "Books",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
  },
  {
    name: "Accessories",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    name: "View All",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];
const promises = [["01", "Quality first", "Thoughtful products selected for everyday life."], ["02", "Easy shopping", "A simple, secure experience from start to finish."], ["03", "Made for you", "Fresh finds and considered essentials, always."]];
const testimonials = [["Aarav K.", "The quality is even better than I expected."], ["Meera S.", "My order arrived quickly and beautifully packed."], ["Riya P.", "Finally, a store that makes everyday shopping feel special."]];

function ProductTile({ product }) {
  return <Link to={`/products/${product._id}`} style={{ backgroundColor: getProductCardColor(product) }} className="group overflow-hidden rounded-2xl p-3 shadow-[0_8px_25px_rgb(32_32_22/8%)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgb(32_32_22/14%)] flex flex-col justify-between">
    <div style={{ backgroundColor: getProductCardColor(product) }} className="relative overflow-hidden rounded-xl">
      <span className="absolute top-2 left-2 z-10 rounded-md bg-[#e11d48] px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
        -18%
      </span>
      <ProductImage src={product.image} alt={product.name} className="product-image h-48 w-full object-contain p-4 sm:h-56 transition duration-300 group-hover:scale-105" />
      <span className="absolute bottom-3 left-3 rounded-full bg-[#202016] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">View item →</span>
    </div>
    <div className="px-1 pb-1 pt-3">
      <div className="flex items-center gap-1.5 text-xs"><span className="tracking-[.1em] text-[#e0ad00]">★★★★★</span><span className="text-slate-500 font-medium">{product.rating ?? "4.8"}</span></div>
      <h3 className="mt-1.5 truncate font-bold text-[#202016] text-sm">{product.name}</h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{product.description || "Thoughtfully selected for everyday living."}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-[#202016] text-base">₹{product.price}</span>
          <span className="text-[11px] text-slate-400 line-through">₹{Math.round(product.price * 1.25)}</span>
        </div>
        <ProductActions productId={product._id} />
      </div>
    </div>
  </Link>;
}

function Home() {
  const [products, setProducts] = useState([]);
  const [homeSearch, setHomeSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts((data.products ?? []).slice(0, 8))).catch(() => setProducts([]));
  }, []);

  const handleHomeSearch = (e) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(homeSearch.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return <main className="store-shell bg-[#fffdf7]">
    <div className="bg-[#202016] px-6 py-2 text-center text-[11px] font-bold uppercase tracking-[.14em] text-white">Free shipping on orders over ₹999 <span className="mx-2 text-[#e7b900]">•</span> New season, new energy</div>

    {/* Home Page Search Bar - Permanently visible on mobile & desktop */}
    <div className="bg-[#fff7d6] border-b border-[#e8d36b]/60 px-4 py-3 sm:px-8">
      <form onSubmit={handleHomeSearch} className="mx-auto max-w-xl">
        <div className="relative flex items-center shadow-sm">
          <input
            type="text"
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
            placeholder="Search clothes, shoes, accessories, electronics..."
            aria-label="Search products"
            className="w-full rounded-full border-2 border-[#202016] bg-white py-2.5 pl-10 pr-24 text-xs sm:text-sm text-[#202016] outline-none placeholder:text-gray-400 focus:border-[#a48500]"
          />
          <span className="absolute left-3.5 text-sm text-slate-500">🔍</span>
          <button
            type="submit"
            className="absolute right-1.5 rounded-full bg-[#202016] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#a48500] cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>
    </div>

    <section className="bg-[#fff7d6] px-6 py-7 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[.8fr_1.2fr]">
        <div className="order-2 py-4 lg:order-1 lg:py-10">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#a48500]">The everyday edit</p>
          <h1 className="mt-4 max-w-lg text-4xl font-black uppercase leading-[.92] tracking-[-.05em] text-[#202016] sm:text-6xl">Elevate your<br /><span className="text-[#a48500]">everyday.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#514810] sm:text-base">Curated fashion, accessories and lifestyle essentials that bring a little more intention to every day.</p>
          <Link to="/products" className="mt-7 inline-flex rounded-full bg-[#202016] px-6 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#e7b900] hover:text-[#202016]">Shop the collection</Link>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold text-[#514810]">
            <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[#a48500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Premium Quality</span>
            <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[#a48500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> Best Price</span>
            <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[#a48500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> 200k+ Customers</span>
          </div>
        </div>
        <div className="order-1 overflow-hidden rounded-2xl border-4 border-[#202016] bg-[#f6ce25] shadow-[8px_8px_0_#202016] lg:order-2"><img src={heroImage} alt="MyStore everyday collection" className="h-64 w-full object-cover object-center sm:h-80 lg:h-[23rem]" /></div>
      </div>
    </section>

    <section className="border-b border-[#e8d36b]/60 bg-white py-6 px-4 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none sm:justify-center sm:gap-6 lg:gap-8">
          {categoryItems.map((cat) => (
            <Link
              key={cat.name}
              to={cat.name === "View All" ? "/products" : `/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center shrink-0 text-center"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition group-hover:scale-105 group-hover:border-[#e7b900] group-hover:bg-[#fff7d6] group-hover:text-[#202016]">
                {cat.icon}
              </div>
              <span className="mt-2 text-[11px] font-bold text-slate-700 group-hover:text-[#202016] whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-[#fff7d6] px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#a48500]">Fresh picks</p><h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#202016] sm:text-3xl">Top picks for you</h2></div><Link to="/products" className="text-xs font-black uppercase text-[#202016] underline decoration-2 underline-offset-4">See all →</Link></div>{products.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductTile key={product._id} product={product} />)}</div> : <p className="rounded-2xl bg-white p-8 text-center text-slate-600">Your collection is loading. Visit the products page to explore.</p>}</div></section>

    <section className="bg-[#fffdf7] px-6 py-10 sm:px-10 lg:px-16"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">{[["New season", "Find your next everyday favorite", "Explore now", "/products"], ["Make it yours", "Small details. Big difference.", "Shop accessories", "/products"], ["Upgrade your routine", "Essentials with a point of view.", "See the edit", "/products"]].map(([eyebrow, title, action, path]) => <Link to={path} key={title} className="rounded-2xl border border-[#e8d36b] bg-[#fff7d6] p-6 transition hover:-translate-y-1 hover:border-[#202016]"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a48500]">{eyebrow}</p><h3 className="mt-3 max-w-xs text-xl font-black leading-tight text-[#202016]">{title}</h3><span className="mt-6 inline-block text-xs font-black uppercase underline decoration-2 underline-offset-4">{action} →</span></Link>)}</div></section>

    <section className="bg-[#202016] px-6 py-12 text-white sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#e7b900]">The MyStore promise</p><h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Made for everyday living</h2></div></div><div className="grid gap-8 sm:grid-cols-3">{promises.map(([number, title, copy]) => <div key={title} className="border-t border-white/20 pt-4"><span className="text-xs font-black text-[#e7b900]">{number}</span><h3 className="mt-3 font-black uppercase">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p></div>)}</div></div></section>

    <section className="bg-[#fffdf7] px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#a48500]">Loved by thousands</p><h2 className="mt-2 text-2xl font-black uppercase text-[#202016] sm:text-3xl">Good things, said simply.</h2></div><span className="text-sm font-black tracking-wider text-[#e0ad00]">★★★★★</span></div><div className="grid gap-4 md:grid-cols-3">{testimonials.map(([name, quote]) => <article key={name} className="rounded-2xl border border-[#e8d36b] bg-white p-5"><div className="text-sm tracking-wider text-[#e0ad00]">★★★★★</div><p className="mt-4 text-sm leading-6 text-[#202016]">“{quote}”</p><p className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">{name}</p></article>)}</div></div></section>

    <section className="bg-[#e7b900] px-6 py-10 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#202016]">Stay in the loop</p><h2 className="mt-2 text-2xl font-black text-[#202016]">Fresh finds, straight to your inbox.</h2></div><Link to="/register" className="rounded-full bg-[#202016] px-6 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-[#202016]">Join MyStore</Link></div></section>

    <section className="border-t border-[#e8d36b]/40 bg-white px-6 py-6 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 text-center sm:grid-cols-4 sm:text-left">
        <div className="flex flex-col items-center sm:flex-row gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7d6] text-[#a48500]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
          </div>
          <div>
            <p className="text-xs font-black text-[#202016]">Free Shipping</p>
            <p className="text-[11px] text-slate-500">On orders over ₹999</p>
          </div>
        </div>
        <div className="flex flex-col items-center sm:flex-row gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7d6] text-[#a48500]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div>
            <p className="text-xs font-black text-[#202016]">Easy Returns</p>
            <p className="text-[11px] text-slate-500">30 days return policy</p>
          </div>
        </div>
        <div className="flex flex-col items-center sm:flex-row gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7d6] text-[#a48500]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <p className="text-xs font-black text-[#202016]">Secure Payments</p>
            <p className="text-[11px] text-slate-500">100% safe checkout</p>
          </div>
        </div>
        <div className="flex flex-col items-center sm:flex-row gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7d6] text-[#a48500]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-black text-[#202016]">24/7 Support</p>
            <p className="text-[11px] text-slate-500">Dedicated assistance</p>
          </div>
        </div>
      </div>
    </section>
  </main>;
}

export default Home;
