import { identity, contact, stats } from "../data/profile";

export default function Hero() {
  return (
    <section id="top" className="bg-grid relative overflow-hidden">
      {/* soft accent glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div>
        {/* rounded-2xl rather than a pill, so the badge still looks deliberate
            when the text wraps to two lines on a narrow screen */}
        <span className="inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 rounded-2xl border border-accent-500/30 bg-accent-500/10 px-4 py-2 text-xs font-semibold text-accent-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
          </span>
          <span>Open to full-time, part-time, contract or freelance</span>
          <span aria-hidden="true" className="hidden text-accent-400/40 sm:inline">·</span>
          <span className="text-accent-300/75">Remote worldwide, or onsite with visa sponsorship</span>
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

          </div>

          {/* Portrait. Slightly desaturated so the red blossoms behind him do
              not fight the emerald accent, with a gradient that fades the
              lower edge into the page background. */}
          <div className="order-first mx-auto w-56 sm:w-64 lg:order-none lg:mx-0 lg:w-full">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/40">
              <img
                src="khaled.jpg"
                alt="Khaled El Nagdy"
                width={546}
                height={683}
                loading="eager"
                className="block w-full saturate-[0.85] contrast-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
            </div>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {stats.map((s) => {
            // mt-auto pins every value to the bottom of the tile, so a label
            // that wraps to two lines does not push its number out of line
            // with the others.
            const body = (
              <>
                <dt className="text-[13px] leading-snug text-slate-400">{s.label}</dt>
                <dd className="mt-auto pt-2 font-display text-3xl font-bold text-accent-400">{s.value}</dd>
              </>
            );
            return s.href ? (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex flex-col bg-ink-900 px-5 py-6 transition hover:bg-ink-800/70"
              >
                {body}
              </a>
            ) : (
              <div key={s.label} className="flex flex-col bg-ink-900 px-5 py-6">
                {body}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
