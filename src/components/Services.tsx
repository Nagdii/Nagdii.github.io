import Section from "./Section";
import { services } from "../data/profile";

const icons: Record<string, string> = {
  dashboard: "M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z",
  model: "M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
  pipeline: "M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M12 15v6",
  automation: "M13 2L4.5 12.5H11L9 22l8.5-10.5H12z",
  sql: "M12 2c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  audit: "M9 11l3 3 8-8M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11",
};

export default function Services() {
  return (
    <Section
      id="services"
      eyebrow="Services"
      title="What I can do for you"
      lead="Available for freelance engagements and full-time roles — the same end-to-end skill set either way."
      className="bg-ink-900/40"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div
            key={s.title}
            className="group rounded-2xl border border-white/10 bg-ink-900 p-6 transition hover:border-accent-500/40"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d={icons[s.icon]} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
