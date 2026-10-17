import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Shop Categories",
    links: [
      { label: "All Products", path: "/products" },
      { label: "Electronics & Tech", path: "/products?category=electronics" },
      { label: "Fashion & Fabric", path: "/products?category=fabric" },
      { label: "Mobile Phones", path: "/products?category=mobile" },
      { label: "Accessories & Shoes", path: "/products?category=shoes" },
    ],
  },
  {
    title: "Customer Services",
    links: [
      { label: "My Orders & Tracking", path: "/orders" },
      { label: "Saved Wishlist", path: "/wishlist" },
      { label: "Shopping Bag", path: "/cart" },
      { label: "Account Profile", path: "/profile" },
    ],
  },
  {
    title: "About & Security",
    links: [
      { label: "Secure Checkout", path: "/checkout" },
      { label: "Return Policy", path: "/" },
      { label: "Terms of Service", path: "/" },
      { label: "Privacy Policy", path: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
      {/* Upper Newsletter & Perks Bar */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Stay Connected
            </span>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Discover thoughtful designs and new arrivals.
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Join thousands of happy customers shopping for quality essentials every day.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md items-center gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Links Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="brand-mark">M</span>
              <span className="text-lg font-black tracking-tight text-slate-900">
                My<span className="text-blue-600">Store</span>
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              A modern, full-stack shopping platform delivering premium electronics, lifestyle accessories, and everyday essentials with verified secure checkout.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>Verified Store &bull; SSL Secured</span>
            </div>
          </div>

          {/* Navigation Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-slate-500 transition hover:text-slate-900 hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} MyStore Inc. All rights reserved.</p>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
              VISA
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
              MASTERCARD
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
              UPI
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
              CASH ON DELIVERY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
