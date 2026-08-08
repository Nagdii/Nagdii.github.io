import { useEffect } from "react";
import { findTool, TOOLS } from "../data/toolsRegistry";

export default function ToolPage({ id }: { id: string }) {
  const tool = findTool(id);

  // Land at the top when switching tools, rather than keeping the old scroll
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!tool) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <h1 className="font-display text-3xl font-bold text-white">Tool not found</h1>
        <p className="mt-3 text-slate-400">That link does not match any of the tools.</p>
        <a href="#top" className="mt-6 inline-block text-sm font-semibold text-accent-300">
          Back to the site
        </a>
      </section>
    );
  }

  const { Component } = tool;
  const others = TOOLS.filter((t) => t.id !== id).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <a href="#top" className="transition hover:text-accent-300">
          Home
        </a>
        <span>/</span>
        <span className="text-slate-400">Free tools</span>
        <span>/</span>
        <span className="text-slate-300">{tool.name}</span>
      </nav>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">{tool.group}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{tool.name}</h1>
      <p className="mt-3 max-w-2xl text-slate-400">{tool.blurb}. Runs entirely in your browser.</p>

      <div className="mt-9 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:p-7">
        <Component />
      </div>

      <div className="mt-14 border-t border-white/10 pt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Other tools</p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((t) => (
            <a
              key={t.id}
              href={`#/tools/${t.id}`}
              className="rounded-xl border border-white/10 bg-ink-900 p-3.5 transition hover:border-accent-500/40"
            >
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="mt-0.5 text-xs text-slate-400">{t.blurb}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
