import { useEffect, useRef, useState } from "react";
import { identity } from "../data/profile";
import { TOOL_GROUPS, toolsByGroup } from "../data/toolsRegistry";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const openTools = () => {
    window.clearTimeout(closeTimer.current);
    setToolsOpen(true);
  };

  const closeToolsSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setToolsOpen(false), 160);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Close the dropdown on an outside click or Escape
  useEffect(() => {
    if (!toolsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToolsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [toolsOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-display text-lg font-bold text-white">
          Khaled<span className="text-accent-400">.</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.slice(0, 3).map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-400 transition hover:text-white">
              {l.label}
            </a>
          ))}

          {/* Hover opens the menu, clicking goes to the full index page.
              The close is delayed so moving the cursor from the trigger down
              into the panel does not dismiss it on the way. */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={openTools}
            onMouseLeave={closeToolsSoon}
          >
            <a
              href="#/tools"
              onFocus={openTools}
              onClick={() => setToolsOpen(false)}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 text-sm transition ${
                toolsOpen ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Free tools
              <Chevron open={toolsOpen} />
            </a>

            {toolsOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-4 w-[34rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-ink-900 p-4 shadow-2xl shadow-black/50">
                {/* CSS columns rather than grid, so groups pack tightly instead
                    of every column stretching to the tallest group's height */}
                <div className="columns-2 gap-x-5">
                  {TOOL_GROUPS.map((g) => (
                    <div key={g} className="mb-4 break-inside-avoid">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {g}
                      </p>
                      <div className="space-y-0.5">
                        {toolsByGroup(g).map((t) => (
                          <a
                            key={t.id}
                            href={`#/tools/${t.id}`}
                            onClick={() => setToolsOpen(false)}
                            className="block rounded-lg px-2.5 py-1.5 transition hover:bg-white/5"
                          >
                            <span className="block text-sm font-medium text-white">{t.name}</span>
                            <span className="block text-xs text-slate-500">{t.blurb}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="#/tools"
                  onClick={() => setToolsOpen(false)}
                  className="mt-1 flex items-center justify-between rounded-lg border-t border-white/10 px-2.5 pb-1 pt-3 text-xs font-semibold text-accent-300 transition hover:text-accent-200"
                >
                  See all tools on one page
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {links.slice(3).map((l) => (
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
        <div className="max-h-[70vh] overflow-y-auto border-t border-white/5 px-5 pb-4 md:hidden">
          {links.slice(0, 3).map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-slate-300"
            >
              {l.label}
            </a>
          ))}

          {/* The label navigates to the index, the chevron expands the list */}
          <div className="flex w-full items-center justify-between">
            <a
              href="#/tools"
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 text-sm text-slate-300"
            >
              Free tools
            </a>
            <button
              onClick={() => setMobileToolsOpen((v) => !v)}
              aria-expanded={mobileToolsOpen}
              aria-label="Show all tools"
              className="p-2.5 text-slate-400"
            >
              <Chevron open={mobileToolsOpen} />
            </button>
          </div>
          {mobileToolsOpen && (
            <div className="mb-1 space-y-3 border-l border-white/10 pl-3">
              {TOOL_GROUPS.map((g) => (
                <div key={g}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{g}</p>
                  {toolsByGroup(g).map((t) => (
                    <a
                      key={t.id}
                      href={`#/tools/${t.id}`}
                      onClick={() => {
                        setOpen(false);
                        setMobileToolsOpen(false);
                      }}
                      className="block py-1.5 text-sm text-slate-300"
                    >
                      {t.name}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          )}

          {links.slice(3).map((l) => (
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
