export default function AnnouncementBar() {
  return (
    <aside
      aria-label="Store announcement"
      className="bg-stone-900 px-4 py-2 text-center text-[11px] font-medium tracking-wider text-stone-200 border-b border-stone-800"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
        <span className="font-semibold text-white">Welcome:</span>
        <span>Thoughtfully selected products for your everyday life</span>
        <span className="hidden sm:inline text-stone-500">•</span>
        <span className="hidden sm:inline text-stone-300">Free delivery on orders over ₹999</span>
      </div>
    </aside>
  );
}
