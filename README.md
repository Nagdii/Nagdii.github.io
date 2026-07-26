# nagdii.github.io — Portfolio

Personal portfolio of **Khaled El Nagdy** — Analytics Engineer & BI Developer.

Live at **https://nagdii.github.io**

## Stack

- [Vite](https://vitejs.dev) + React 19 + TypeScript
- Tailwind CSS v4
- Deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
```

## Editing content

All site content (bio, experience, services, case studies, contact info) lives in
[`src/data/profile.ts`](src/data/profile.ts) — edit that file, no component changes needed.

The **Download CV** buttons link to `public/cv/Khaled-El-Nagdy-CV.pdf`; replace that
file to update the CV.
