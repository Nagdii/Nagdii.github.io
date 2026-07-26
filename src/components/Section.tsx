import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}

export default function Section({ id, eyebrow, title, lead, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        {lead && <p className="mt-4 max-w-2xl text-slate-400">{lead}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
