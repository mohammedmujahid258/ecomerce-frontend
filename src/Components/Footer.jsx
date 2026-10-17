import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Shop Categories",
    links: [
      { label: "All Products", path: "/products" },
      { label: "Smartphones & Mobile", path: "/products?category=mobile" },
      { label: "Electronics & Audio", path: "/products?category=electronics" },
      { label: "Apparel & Fabric", path: "/products?category=fabric" },
      { label: "Footwear & Shoes", path: "/products?category=shoes" },
      { label: "Eyewear & Accessories", path: "/products?category=glass" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "My Orders & Tracking", path: "/orders" },
      { label: "Saved Items", path: "/wishlist" },
      { label: "Shopping Bag", path: "/cart" },
      { label: "Account Profile", path: "/profile" },
    ],
  },
  {
    title: "Store Policy",
    links: [
      { label: "Secure Checkout", path: "/checkout" },
      { label: "Complimentary Delivery", path: "/products" },
      { label: "Authenticity Guarantee", path: "/" },
      { label: "Terms of Service", path: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/90 bg-white text-stone-600">
      {/* Upper Newsletter Bar */}
      <div className="border-b border-stone-100 bg-[#faf8f5] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Stay Connected
            </span>
            <h3 className="mt-1 font-editorial text-2xl font-normal tracking-tight text-stone-900 sm:text-3xl">
              Thoughtfully selected for your everyday life.
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 max-w-md">
              Receive updates on seasonal arrivals and exclusive collection releases.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md items-center gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-100"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold text-white transition hover:bg-stone-800 cursor-pointer shadow-xs active:scale-95"
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
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold tracking-tight text-white shadow-xs">
                M
              </span>
              <span className="text-lg font-bold tracking-tight text-stone-900">
                MyStore
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              A minimalist, modern store bringing you curated smartphones, electronics, fashion, and lifestyle essentials.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-stone-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-stone-900" />
              <span>Verified Merchant &bull; SSL Secured</span>
            </div>
          </div>

          {/* Navigation Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-900">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-stone-500 transition hover:text-stone-900 hover:underline"
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-100 pt-8 sm:flex-row text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} MyStore. All rights reserved.</p>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-stone-500">
            <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5">
              VISA
            </span>
            <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5">
              MASTERCARD
            </span>
            <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5">
              UPI
            </span>
            <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5">
              CASH ON DELIVERY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
