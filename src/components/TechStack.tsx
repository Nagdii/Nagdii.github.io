import Section from "./Section";
import { techStack } from "../data/profile";

export default function TechStack() {
  return (
    <Section
      id="stack"
      eyebrow="Tech Stack"
      title="Tools I work with"
      className="bg-ink-900/40"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {techStack.map((g) => (
          <div key={g.group} className="rounded-2xl border border-white/10 bg-ink-900 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent-400">{g.group}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
