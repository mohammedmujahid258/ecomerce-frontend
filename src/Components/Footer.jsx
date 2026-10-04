import { Link } from "react-router-dom";

const linkGroups = [
  { title: "Shop", links: [["All products", "/products"], ["New arrivals", "/products"], ["Wishlist", "/wishlist"], ["Cart", "/cart"]] },
  { title: "Customer care", links: [["My orders", "/orders"], ["Delivery information", "/"], ["Returns & exchanges", "/"], ["Contact us", "mailto:support@mystore.com"]] },
  { title: "About MyStore", links: [["Our story", "/"], ["Careers", "/"], ["Sign in", "/login"], ["Create an account", "/register"]] },
];

function FooterLink({ label, path }) {
  const className = "group flex w-full items-center justify-between border-b border-white/10 py-2.5 text-sm font-medium text-white transition hover:border-[#e7b900] hover:text-[#e7b900]";
  const content = <><span>{label}</span><span className="text-[#e7b900] opacity-0 transition group-hover:opacity-100">↗</span></>;
  return path.startsWith("mailto:") ? <a href={path} className={className}>{content}</a> : <Link to={path} className={className}>{content}</Link>;
}

function Footer() {
  return (
    <footer className="border-t-2 border-[#202016] bg-[#202016] text-white">
      <section className="bg-[#e7b900] px-6 py-10 text-[#202016] sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.2em]">The MyStore edit</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Good things are on the way.</h2><p className="mt-2 text-sm font-medium text-[#514810]">Be the first to know about new drops and limited collections.</p></div>
          <form className="flex w-full max-w-md" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="footer-email">Email address</label><input id="footer-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 rounded-l-md border-2 border-[#202016] bg-white px-4 py-3 text-sm text-[#202016] outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white" /><button type="submit" className="rounded-r-md border-2 border-l-0 border-[#202016] bg-[#202016] px-5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-[#202016]">Sign up</button></form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="MyStore home"><span className="brand-mark">M</span><span className="text-xl font-extrabold tracking-tight">My<span className="text-[#e7b900]">Store</span></span></Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-slate-300">Everyday pieces. Distinctly yours. A considered edit of fashion, accessories and lifestyle essentials.</p>
            <div className="mt-7 space-y-2 text-sm"><p className="font-semibold text-white">Need help?</p><a href="mailto:support@mystore.com" className="text-[#e7b900] transition hover:text-white">support@mystore.com</a><p className="text-slate-400">Mon–Fri, 9:00–18:00</p></div>
          </div>

          {linkGroups.map(({ title, links }) => <div key={title}><h2 className="text-xs font-black uppercase tracking-[.18em] text-[#e7b900]">{title}</h2><nav className="mt-4" aria-label={`${title} links`}>{links.map(([label, path]) => <FooterLink key={label} label={label} path={path} />)}</nav></div>)}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/15 pt-7 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-white">Shop with confidence</p><p className="mt-2 text-xs text-slate-400">Secure checkout · Carefully packed · Customer-first support</p></div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400"><span className="rounded border border-white/20 px-2 py-1.5">Visa</span><span className="rounded border border-white/20 px-2 py-1.5">Mastercard</span><span className="rounded border border-white/20 px-2 py-1.5">UPI</span></div></div>

        <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} MyStore. All rights reserved.</p><div className="flex flex-wrap gap-x-5 gap-y-2"><a href="#" className="transition hover:text-white">Privacy policy</a><a href="#" className="transition hover:text-white">Terms & conditions</a><a href="mailto:support@mystore.com" className="transition hover:text-white">Support</a></div></div>
      </div>
    </footer>
  );
}

export default Footer;
