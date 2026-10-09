/**
 * Prerender contract — single source of truth for what the committed snapshot
 * and deployed `dist/index.html` #root must contain.
 *
 * Authoring copy lives in `landing.content.js` (and the story UI that reads it).
 * `prerender/root.snapshot.html` is a derived artifact; builds fail when it drifts.
 */

import { FAQ_ITEMS, LANDING_COPY, STORY_COPY } from './landing.content.js';

/** Files whose contents are hashed into the snapshot fingerprint. */
export const PRERENDER_FINGERPRINT_FILES = [
  'src/pages/landing/landing.content.js',
  'src/pages/landing/prerenderContract.js',
  'src/pages/landing/LandingPage.jsx',
  'src/pages/landing/components/story/TimeStoryExperience.jsx',
];

const STORY_FAQ = FAQ_ITEMS.filter(({ id }) => ['free', 'private', 'app-store'].includes(id));

/** Phrases that must appear in prerendered #root HTML (decoded text / attributes). */
export const CRITICAL_LANDING_PHRASES = [
  ...STORY_COPY.chapters.hero.titleLines,
  STORY_COPY.chapters.hero.body,
  STORY_COPY.chapters.return.titleLines[0],
  STORY_COPY.final.titleLines[0],
  STORY_COPY.final.privacyTitle,
  STORY_COPY.final.faqEyebrow,
  STORY_FAQ[0].question,
  STORY_COPY.spark.question,
];

/** Puppeteer readiness probes (subset of critical copy). */
export const PRERENDER_READY_PHRASES = [
  STORY_COPY.chapters.hero.titleLines[0],
  STORY_COPY.chapters.return.titleLines[0],
];

/**
 * Max allowed raw occurrences in prerendered HTML.
 * Marquee dual-track may repeat a line twice; animation sr-only + visual twins are forbidden.
 */
export const PHRASE_OCCURRENCE_LIMITS = [
  { phrase: STORY_COPY.chapters.hero.titleLines[0], max: 1, label: 'hero title line' },
  { phrase: STORY_COPY.chapters.hero.titleLines[1], max: 1, label: 'hero title line' },
  { phrase: LANDING_COPY.hero.title, max: 1, label: 'legacy hero title (no sr-only twin)' },
  ...LANDING_COPY.ticker.map((phrase) => ({
    phrase,
    max: 2,
    label: 'marquee ticker line',
  })),
];

export const MAX_SEMANTIC_H1 = 1;
