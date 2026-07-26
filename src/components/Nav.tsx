import { useState } from "react";
import { identity } from "../data/profile";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-display text-lg font-bold text-white">
          Khaled<span className="text-accent-400">.</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-400 transition hover:text-white">
              {l.label}
            </a>
          ))}
          <a
            href={identity.cvPath}
            download
            className="rounded-lg border border-accent-500/40 px-4 py-1.5 text-sm font-semibold text-accent-300 transition hover:bg-accent-500/10"
          >
            Download CV
          </a>
        </div>

        <button
          className="p-2 text-slate-300 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-5 pb-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-slate-300"
            >
              {l.label}
            </a>
          ))}
          <a href={identity.cvPath} download className="block py-2.5 text-sm font-semibold text-accent-300">
            Download CV
          </a>
        </div>
      )}
    </header>
  );
}
