import { useEffect } from "react";
import { TOOLS, TOOL_GROUPS, toolsByGroup } from "../data/toolsRegistry";

export default function ToolsIndex() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <a href="#top" className="transition hover:text-accent-300">
          Home
        </a>
        <span>/</span>
        <span className="text-slate-300">Free tools</span>
      </nav>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">Free tools</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
        {TOOLS.length} utilities for analytics engineers
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
        Small things I reach for on real projects, mostly built because the alternative was doing the same fiddly job
        by hand again. Everything runs in your browser. No sign-up, no upload, nothing leaves the page.
      </p>

      <div className="mt-12 space-y-10">
        {TOOL_GROUPS.map((group) => (
          <div key={group}>
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-xl font-semibold text-white">{group}</h2>
              <span className="text-xs text-slate-500">
                {toolsByGroup(group).length} {toolsByGroup(group).length === 1 ? "tool" : "tools"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {toolsByGroup(group).map((t) => (
                <a
                  key={t.id}
                  href={`#/tools/${t.id}`}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-ink-900 p-5 transition hover:border-accent-500/40 hover:bg-ink-800/50"
                >
                  <span className="font-display text-base font-semibold text-white transition group-hover:text-accent-300">
                    {t.name}
                  </span>
                  <span className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{t.blurb}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-400">
                    Open
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
