import { contact, identity } from "../data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {identity.name} · {identity.title}
        </p>
        <div className="flex gap-5 text-sm text-slate-400">
          <a href={contact.github} target="_blank" rel="noreferrer" className="transition hover:text-white">
            GitHub
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className="transition hover:text-white">
            LinkedIn
          </a>
          <a href={`mailto:${contact.email}`} className="transition hover:text-white">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
