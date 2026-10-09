# Prerender pipeline — source of truth

## Verdict

**Authoring source of truth:** React landing under `src/pages/landing/`  
(especially `landing.content.js` + `components/story/TimeStoryExperience.jsx`).

**Derived artifact:** `prerender/root.snapshot.html` (generated at build time; not tracked in this public mirror).  
A **local full** `npm run build` (Puppeteer) writes and validates it.  
Production deploys may inject a committed snapshot when Chromium is unavailable (`VERCEL=1` / `SKIP_PRERENDER=1`).

## What `npm run build` runs

1. `npm run og:build` → `scripts/generate-og.js` (curated OG image)
2. `vite build` → bundles + `pear-static-prerender` closeBundle hook:
   - inject Quicksand font preloads into `dist/index.html`
   - **prerender step** (see below)
   - write OpenAI Sites worker artifacts under `dist/`
3. `scripts/generate-sitemap.js`

Vite also replaces `%SITE_*%` / `%BUILD_ID%` / seasonal boot script placeholders in `index.html` during transform (meta/JSON-LD/theme) — that is **shell** HTML, not the landing body.

## Prerender step (three modes, one validation)

| Environment        | Behavior                                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local (default)    | Puppeteer loads `dist/`, waits for `[data-prerender-ready]` + contract phrases + `#faq`, writes stamped `#root` HTML → `dist/index.html` **and** `prerender/root.snapshot.html`, then validates |
| `VERCEL=1`         | Inject committed snapshot → validate (no Chromium)                                                                                                                                              |
| `SKIP_PRERENDER=1` | Same as Vercel: inject committed snapshot → validate (no Chromium)                                                                                                                              |

Validation (`scripts/validate-prerender.mjs` / `npm run validate:prerender`) **fails the build** when:

- snapshot fingerprint ≠ hash of fingerprint source files (stale)
- critical landing phrases from `prerenderContract.js` are missing
- root has ≠ 1 semantic `<h1>`
- marquee / duplicated animation text exceeds occurrence limits

Fingerprint sources are listed in `src/pages/landing/prerenderContract.js`.

## Does a local production build update the committed snapshot?

**Yes** — only when Puppeteer runs (not under `VERCEL=1` / `SKIP_PRERENDER=1`).  
Commit `prerender/root.snapshot.html` after landing markup/copy changes.

## What Vercel puts into `dist/index.html`

1. Vite-built shell (`index.html` + hashed assets + meta/boot placeholders resolved)
2. Font preload links
3. **Full `#root` inner HTML** from committed `prerender/root.snapshot.html`
4. Sites worker copies (unrelated to crawler HTML)

## Drift risk (before this contract)

Build, snapshot, and production HTML **could silently diverge**: change React copy → forget local Puppeteer rebuild → Vercel keeps serving the old committed snapshot. Deployed [getpairo.app](https://getpairo.app) still showed the previous hero (“for the two of you…”) while the local snapshot already had the cinematic story — that is exactly this failure mode.

After this change, CI and Vercel builds **fail** on a stale or polluted snapshot instead of shipping it.

## Workflow when editing the landing

1. Change copy only in `landing.content.js` (or story components that read it).
2. Update `prerenderContract.js` if new phrases must be required.
3. Run `npm run build` locally (Puppeteer regenerates the snapshot).
4. Commit source **and** `prerender/root.snapshot.html`.
5. Push — Vercel injects the same snapshot.

## Public mirror note

This document describes the prerender pipeline in the **[pairo-site](https://github.com/tigerweirdo/pairo-site)** public mirror. The production deployment may commit `prerender/root.snapshot.html`; this mirror regenerates it on each full `npm run build` instead.
