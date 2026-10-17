export default function AnnouncementBar() {
  return (
    <aside aria-label="Store announcement" className="bg-slate-950 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-slate-200 border-b border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 font-semibold text-white">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Special Offer:
        </span>
        <span>Free express delivery on orders over ₹999</span>
        <span className="hidden sm:inline text-slate-500">•</span>
        <span className="hidden sm:inline text-slate-300">100% Verified Authentic Products</span>
      </div>
    </aside>
  );
}
