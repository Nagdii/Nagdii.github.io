import { identity, contact, stats } from "../data/profile";

export default function Hero() {
  return (
    <section id="top" className="bg-grid relative overflow-hidden">
      {/* soft accent glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3.5 py-1.5 text-xs font-semibold text-accent-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
          </span>
          Available for freelance &amp; full-time roles
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
          {identity.tagline.replace(".", "")}
          <span className="text-accent-400">.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          I'm <span className="font-semibold text-white">{identity.name}</span>, an{" "}
          {identity.title.replace(" & ", " and ")} based in Cairo. {identity.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          <a
            href="#projects"
            className="rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-accent-400"
          >
            View Case Studies
          </a>
          <a
            href={identity.cvPath}
            download
            className="rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Download CV
          </a>
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-accent-500/60 hover:text-accent-300"
          >
            WhatsApp Me
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-900 px-6 py-6">
              <dt className="order-last mt-1 text-sm text-slate-400">{s.label}</dt>
              <dd className="font-display text-3xl font-bold text-accent-400">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
