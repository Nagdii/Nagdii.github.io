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

            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-2 text-sm font-semibold text-accent-300 transition hover:bg-accent-500/20"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
                {p.repoLabel ?? "View on GitHub"}
              </a>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
