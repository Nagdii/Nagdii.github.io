import Section from "./Section";
import { contact, identity } from "../data/profile";

const ICONS: Record<string, string> = {
  email: "M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5zM3.5 7l8.5 6 8.5-6",
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.6l-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3z",
  phone:
    "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.3c0-1.27-.02-2.9-1.8-2.9-1.8 0-2.07 1.38-2.07 2.8V21h-4z",
  github:
    "M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.3-3.5-1.3-.5-1.2-1.2-1.5-1.2-1.5-.9-.7 0-.7 0-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5z",
};

const channels = [
  { key: "email", label: "Email", value: contact.email, href: `mailto:${contact.email}?subject=Project inquiry`, note: "Fastest" },
  { key: "whatsapp", label: "WhatsApp", value: contact.phone, href: contact.whatsapp },
  { key: "phone", label: "Phone", value: contact.phone, href: contact.phoneHref },
  { key: "linkedin", label: "LinkedIn", value: "linkedin.com/in/nagdii", href: contact.linkedin },
  { key: "github", label: "GitHub", value: "github.com/Nagdii", href: contact.github },
];

export default function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's build your reporting layer"
      lead="A freelance dashboard project or a full-time analytics role, either way I usually reply within a day."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-7 lg:col-span-2 lg:self-start">
          <h3 className="font-display text-xl font-semibold text-white">Tell me what needs fixing</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            A refresh that keeps failing, a model nobody quite trusts, or a dashboard that has to exist by Friday.
            Send me a line about it and I'll tell you honestly whether I'm the right person to help.
          </p>
          <div className="mt-7">
            <a
              href={identity.cvPath}
              download
              className="block rounded-lg bg-accent-500 px-5 py-3 text-center text-sm font-semibold text-ink-950 transition hover:bg-accent-400"
            >
              Download CV
            </a>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Based in {identity.location.split(" · ")[0]}. I've worked remotely with teams in Canada and Saudi
              Arabia, so time zones are rarely the problem.
            </p>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-3">
          {channels.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-900 px-5 py-4 transition hover:border-accent-500/40 hover:bg-ink-800/60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition group-hover:bg-accent-500/10 group-hover:text-accent-300">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICONS[c.key]} />
                </svg>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  {c.label}
                </span>
                <span className="block truncate text-sm font-medium text-white">{c.value}</span>
              </span>

              {c.note && (
                <span className="hidden shrink-0 rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-[11px] font-semibold text-accent-300 sm:block">
                  {c.note}
                </span>
              )}

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-accent-400"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
