import Section from "./Section";
import { experience, education } from "../data/profile";

export default function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Where I've built"
      lead="Regulated enterprise environments, international stakeholders, and Agile delivery teams."
    >
      <ol className="relative space-y-10 border-l border-white/10 pl-8">
        {experience.map((role) => (
          <li key={`${role.company}-${role.period}`} className="relative">
            <span className="absolute -left-[2.45rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent-500 bg-ink-950" />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-display text-xl font-semibold text-white">{role.title}</h3>
              <span className="text-accent-400">·</span>
              <span className="font-medium text-accent-300">{role.company}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {role.period} · {role.location}
            </p>
            <ul className="mt-3 space-y-2">
              {role.bullets.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500/70" />
                  {b}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">Education</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {education.map((e) => (
            <div key={e.qualification} className="rounded-2xl border border-white/10 bg-ink-900 p-6">
              <p className="font-medium leading-snug text-white">{e.qualification}</p>
              <p className="mt-1.5 text-sm text-accent-300">{e.institution}</p>
              <p className="mt-1 text-sm text-slate-500">
                {e.period} · {e.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
