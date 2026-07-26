import Section from "./Section";
import { contact, identity } from "../data/profile";

const channels = [
  { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { label: "WhatsApp", value: contact.phone, href: contact.whatsapp },
  { label: "Phone", value: contact.phone, href: contact.phoneHref },
  { label: "LinkedIn", value: "linkedin.com/in/nagdii", href: contact.linkedin },
  { label: "GitHub", value: "github.com/Nagdii", href: contact.github },
];

export default function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's build your reporting layer"
      lead="Whether it's a freelance dashboard project or a full-time analytics role — I usually reply within a day."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-7 lg:col-span-2">
          <h3 className="font-display text-xl font-semibold text-white">Start a conversation</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Fastest way to reach me — one click, no forms.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={`mailto:${contact.email}?subject=Project inquiry`}
              className="rounded-lg bg-accent-500 px-5 py-3 text-center text-sm font-semibold text-ink-950 transition hover:bg-accent-400"
            >
              Email Me
            </a>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-accent-500/60"
            >
              Message on WhatsApp
            </a>
            <a
              href={identity.cvPath}
              download
              className="rounded-lg border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/40"
            >
              Download CV
            </a>
          </div>
        </div>

        <div className="grid content-start gap-3 lg:col-span-3 sm:grid-cols-2">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-ink-900 px-6 py-5 transition hover:border-accent-500/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{c.label}</p>
              <p className="mt-1.5 break-all text-sm font-medium text-white">{c.value}</p>
            </a>
          ))}
          <div className="rounded-2xl border border-white/10 bg-ink-900 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Location</p>
            <p className="mt-1.5 text-sm font-medium text-white">{identity.location}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
