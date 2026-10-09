/**
 * Prerender helpers: fingerprint, inject, validate.
 * Used by vite build (`pear-static-prerender`) and `npm run validate:prerender`.
 *
 * Source of truth: React landing copy (`src/pages/landing/*`).
 * Derived artifact: `prerender/root.snapshot.html` (committed for Chromium-free deploys).
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '..');
export const SNAPSHOT_PATH = path.join(REPO_ROOT, 'prerender/root.snapshot.html');
export const DIST_INDEX_PATH = path.join(REPO_ROOT, 'dist/index.html');

const FP_MARKER_RE = /<!--pear-prerender-fp:([a-f0-9]+)-->/;

async function loadContract() {
  const mod = await import(
    pathToFileURL(path.join(REPO_ROOT, 'src/pages/landing/prerenderContract.js')).href
  );
  return mod;
}

export function computeSourceFingerprint(rootDir = REPO_ROOT) {
  return loadContract().then((contract) => {
    const hash = crypto.createHash('sha256');
    for (const rel of contract.PRERENDER_FINGERPRINT_FILES) {
      const abs = path.join(rootDir, rel);
      if (!fs.existsSync(abs)) {
        throw new Error(`[pear] prerender fingerprint source missing: ${rel}`);
      }
      hash.update(rel);
      hash.update('\0');
      hash.update(fs.readFileSync(abs));
      hash.update('\0');
    }
    return hash.digest('hex').slice(0, 16);
  });
}

export function stampSnapshot(rootHtml, fingerprint) {
  const body = rootHtml.replace(FP_MARKER_RE, '').replace(/^\uFEFF?/, '');
  return `<!--pear-prerender-fp:${fingerprint}-->${body}`;
}

export function readSnapshotFingerprint(html) {
  return html.match(FP_MARKER_RE)?.[1] ?? null;
}

export function replaceRootHtml(html, rootHtml) {
  const open = '<div id="root">';
  const start = html.indexOf(open);
  if (start === -1) return html;

  const bodyClose = html.indexOf('</body>', start);
  if (bodyClose === -1) return html;

  const closeIdx = html.lastIndexOf('</div>', bodyClose);
  if (closeIdx <= start) return html;

  return `${html.slice(0, start + open.length)}${rootHtml}${html.slice(closeIdx)}`;
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const next = haystack.indexOf(needle, idx);
    if (next === -1) break;
    count += 1;
    idx = next + needle.length;
  }
  return count;
}

function countSemanticH1(html) {
  // Strip aria-hidden subtrees so decorative clones do not count as landmarks.
  const withoutHidden = html.replace(/<[^>]+aria-hidden(?:="true")?[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
  return (withoutHidden.match(/<h1\b/gi) || []).length;
}

/**
 * @param {string} html - snapshot root HTML or full dist/index.html
 * @param {{ fingerprint: string, label: string }} opts
 */
export async function validatePrerenderHtml(html, { fingerprint, label }) {
  const contract = await loadContract();
  const errors = [];

  if (!html?.trim()) {
    errors.push(`${label}: HTML is empty`);
  }

  const stamped = readSnapshotFingerprint(html);
  if (!stamped) {
    errors.push(
      `${label}: missing fingerprint marker — run a full local \`npm run build\` (Puppeteer) to regenerate prerender/root.snapshot.html`,
    );
  } else if (stamped !== fingerprint) {
    errors.push(
      `${label}: stale snapshot (fp ${stamped} ≠ source ${fingerprint}) — regenerate with local \`npm run build\` and commit prerender/root.snapshot.html`,
    );
  }

  for (const phrase of contract.CRITICAL_LANDING_PHRASES) {
    if (!html.includes(phrase)) {
      errors.push(`${label}: missing critical landing copy ${JSON.stringify(phrase)}`);
    }
  }

  const h1Count = countSemanticH1(html);
  if (h1Count !== contract.MAX_SEMANTIC_H1) {
    errors.push(
      `${label}: expected exactly ${contract.MAX_SEMANTIC_H1} semantic <h1>, found ${h1Count}`,
    );
  }

  const hasMarquee = /pear-marquee/i.test(html);
  for (const { phrase, max, label: ruleLabel } of contract.PHRASE_OCCURRENCE_LIMITS) {
    const count = countOccurrences(html, phrase);
    if (count === 0) continue;
    if (count > max) {
      errors.push(
        `${label}: duplicated ${ruleLabel} ${JSON.stringify(phrase)} appears ${count}× (max ${max})${
          hasMarquee ? ' — marquee/animation pollution in prerender HTML' : ''
        }`,
      );
    }
  }

  if (hasMarquee) {
    const tickerHits = contract.PHRASE_OCCURRENCE_LIMITS.filter((r) =>
      r.label.startsWith('marquee'),
    ).reduce((sum, r) => sum + countOccurrences(html, r.phrase), 0);
    if (tickerHits > 10) {
      errors.push(
        `${label}: marquee ticker text pollutes prerender (${tickerHits} ticker phrase hits) — keep seamless-loop copies ≤2 per line, do not .repeat() strips into HTML`,
      );
    }
  }

  if (errors.length) {
    const message = ['[pear] prerender validation failed:', ...errors.map((e) => `  - ${e}`)].join(
      '\n',
    );
    throw new Error(message);
  }
}

export async function validateSnapshotFile(snapshotPath = SNAPSHOT_PATH) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(
      '[pear] prerender/root.snapshot.html missing — run npm run build locally to regenerate',
    );
  }
  const fingerprint = await computeSourceFingerprint();
  const html = fs.readFileSync(snapshotPath, 'utf8');
  await validatePrerenderHtml(html, { fingerprint, label: 'prerender/root.snapshot.html' });
  return fingerprint;
}

export async function injectSnapshotRoot(distDir, snapshotPath = SNAPSHOT_PATH) {
  const fingerprint = await validateSnapshotFile(snapshotPath);
  const rootHtml = fs.readFileSync(snapshotPath, 'utf8');
  const indexPath = path.join(distDir, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = replaceRootHtml(html, rootHtml);
  fs.writeFileSync(indexPath, html);
  await validatePrerenderHtml(html, { fingerprint, label: 'dist/index.html' });
  console.info('[pear] injected + validated prerender snapshot → dist/index.html');
  return fingerprint;
}

/** CLI: `node scripts/validate-prerender.mjs` */
async function main() {
  const fingerprint = await validateSnapshotFile();
  console.info(`[pear] prerender snapshot OK (fp ${fingerprint})`);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
