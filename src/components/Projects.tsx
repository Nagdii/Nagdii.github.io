import Section from "./Section";
import { projects } from "../data/profile";

export default function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Case Studies"
      title="Selected work"
      lead="Enterprise BI work is confidential by nature — these case studies describe the problem, approach, and outcome. Happy to walk through the details in a call."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.title}
            className="flex flex-col rounded-2xl border border-white/10 bg-ink-900 p-7 transition hover:border-accent-500/40"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{p.context}</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-white">{p.title}</h3>

            <dl className="mt-5 flex-1 space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="font-semibold text-rose-300/80">Problem</dt>
                <dd className="mt-1 text-slate-400">{p.problem}</dd>
              </div>
              <div>
                <dt className="font-semibold text-sky-300/80">Approach</dt>
                <dd className="mt-1 text-slate-400">{p.solution}</dd>
              </div>
              <div>
                <dt className="font-semibold text-accent-300">Outcome</dt>
                <dd className="mt-1 text-slate-400">{p.outcome}</dd>
              </div>
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2">
              {p.stack.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  {t}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
