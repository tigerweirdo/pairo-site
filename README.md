# pairo — marketing site (public mirror)

> **Public mirror** of the production marketing codebase ([`tigerweirdo/marketing`](https://github.com/tigerweirdo/marketing), private). This repo is a **history-free snapshot** for portfolio review — issues and releases are tracked on the production repo. **Source on GitHub:** [github.com/tigerweirdo/pairo-site](https://github.com/tigerweirdo/pairo-site)

Portfolio build of the landing page for **[pairo](https://getpairo.app)** — a couples PWA (shared calendar, daily Sparks, lists, and small rituals) with a living seasonal colour system and scroll-driven storytelling.

**Live product:** [https://getpairo.app](https://getpairo.app)

![Hero — seasonal story section](./docs/screenshot-hero.png)

## What you are looking at

Single-page React site: one long cinematic scroll story, a draggable year scrubber, FAQ, and beta CTA. No router — everything ships as one Vite bundle plus a **Puppeteer-generated `#root` snapshot** on build (see [`docs/prerender.md`](docs/prerender.md)).

### Seasonal colour engine

- **Site-wide theme** (`src/lib/seasonColors.js`) — day-of-year cosine blends between romantic-season palettes, with time-of-day, hemisphere, streak, and special-day modifiers. Exposed as CSS custom properties (`--seasonal-*`, legacy `--pear-h/s/l` brand hooks) and synced into `theme-color` at boot.
- **Story scene** (`PearWorldCanvas` + `sceneSeasonEngine.js`) — WebGPU / WebGL pair-mark scene; seasonal mixing uses **OKLCH / OKLab** so light on the 3D form matches the calendar palette.

### Scroll & motion

- **GSAP + ScrollTrigger** on native scroll (no scroll-jacking library).
- Shared scroll bus in `src/lib/scroll/` — one page-progress trigger drives the growing stem, ribbon, and story chapters.
- **`prefers-reduced-motion`** respected everywhere; prerender runs with reduced motion so the snapshot is stable.

## Stack

| Area      | Choice                                                    |
| --------- | --------------------------------------------------------- |
| UI        | React 19                                                  |
| Build     | Vite 6                                                    |
| Styling   | Tailwind CSS 3 + design tokens in `src/styles/`           |
| Animation | GSAP 3 + `@gsap/react`                                    |
| 3D (lazy) | React Three Fiber + Three.js (WebGPU with WebGL fallback) |
| SEO shell | Puppeteer snapshot → `prerender/root.snapshot.html` (build output) |
| Analytics | Optional Plausible (production domain only; see `src/lib/analytics.js`) |
| Deploy    | Example headers in `vercel.json` (SPA rewrite + CSP)      |

## Quality tooling

| Tool                                                                        | Role                                                                              |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) | ESLint, Prettier, production build, [size-limit](.size-limit.json), Lighthouse CI |
| **Husky + lint-staged**                                                     | Pre-commit lint/format on staged files                                            |
| **commitlint**                                                              | Conventional Commits on `commit-msg`                                              |
| **Lighthouse CI** ([`lighthouserc.json`](lighthouserc.json))                | a11y/SEO ≥ 0.95, performance ≥ 0.9 (warn)                                         |
| **Dependabot**                                                              | Weekly npm + Actions updates                                                      |

CI runs a **full** `npm run build` (Puppeteer prerender) so no committed snapshot is required in this mirror.

## Requirements

- Node **≥ 20** ([`.nvmrc`](.nvmrc))

## Run locally

```bash
npm install
npm run dev
```

Optional env (see [`.env.example`](.env.example)):

- `VITE_SITE_URL` — canonical origin for meta/sitemap (default `https://getpairo.app`)
- `VITE_PEAR_APP_URL` — web app URL for the primary beta CTA (legacy env name; points at the PWA)

## Build & verify

```bash
npm run build          # OG image → Vite bundle → Puppeteer prerender → sitemap
npm run validate:prerender   # after build, checks generated snapshot
npm run preview
npm run lint && npm run format:check
npm run size           # after build — chunk budgets
npm run lhci           # after build — Lighthouse CI locally
```

Details: [`docs/prerender.md`](docs/prerender.md).

## Project layout

```
src/
  pages/landing/     copy (`landing.content.js`) + TimeStoryExperience
  lib/seasonColors.js   seasonal engine
  lib/scroll/        scroll progress + GSAP hooks
  components/        brand, layout, seasonal UI
prerender/           snapshot written here on build (gitignored in this mirror)
scripts/             OG image, sitemap, prerender validation
```

Imports use the `@/` alias → `src/`.

## Legacy naming (intentional)

The product is **pairo** in user-facing copy and URLs. These **Pear** identifiers remain in code to avoid a risky rename blast radius:

- React components and files: `PearBrandMark`, `PearIcons`, `PearWorldCanvas`, `pear-icon.svg`, etc.
- CSS classes and tokens: `pear-marquee`, `--pear-icon-*`, `--pear-h/s/l`
- Build/plugin ids: `pear-static-prerender`, `meta name="pear-build"`
- Env: `VITE_PEAR_APP_URL`
- Dev flags: `?pear_perf=1`, `localStorage.pear_perf`
- Unused legacy hero: `HeroSection` + `PearWordMorph` (pair ↔ pear letter morph) — not mounted on the current landing route

## License

Source is published for portfolio review; app branding and assets belong to the pairo project.
