import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  DEFAULT_SITE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  buildMarketingJsonLd,
} from './src/constants/site.js';
import { computeSeasonalRootStyles, resolveHemisphereSync } from './src/lib/seasonColors.js';
import { buildMarketingBootScript } from './src/lib/theme/syncBrandTheme.js';
import { SCRUBBER_MODIFIER_OPTS } from './src/lib/theme/scrubberPreview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function resolveBuildId() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'dev';
  }
}

const BUILD_ID = resolveBuildId();

const SITE_URL = process.env.VITE_SITE_URL || DEFAULT_SITE_URL;

function injectMeta(html) {
  const hemisphere = resolveHemisphereSync();
  const seasonalBootScript = buildMarketingBootScript(new Date(), hemisphere);
  const { props } = computeSeasonalRootStyles(new Date(), hemisphere, SCRUBBER_MODIFIER_OPTS);
  const themeColor = props['--seasonal-primary-hsl'] || 'hsl(135, 45%, 50%)';
  const jsonLd = JSON.stringify(buildMarketingJsonLd(SITE_URL));

  return html
    .replaceAll('%BUILD_ID%', BUILD_ID)
    .replaceAll('%SEASONAL_BOOT_SCRIPT%', seasonalBootScript)
    .replaceAll('%THEME_COLOR%', themeColor)
    .replaceAll('%SITE_URL%', SITE_URL)
    .replaceAll('%SITE_NAME%', SITE_NAME)
    .replaceAll('%SITE_TITLE%', SITE_TITLE)
    .replaceAll('%SITE_DESCRIPTION%', SITE_DESCRIPTION)
    .replaceAll('%JSON_LD%', jsonLd.replace(/</g, '\\u003c'));
}

function injectFontPreloads(html, distDir) {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return html;

  const files = fs.readdirSync(assetsDir);
  const patterns = [
    /quicksand-latin-ext-400-normal.*\.woff2$/,
    /quicksand-latin-ext-600-normal.*\.woff2$/,
    /quicksand-latin-ext-700-normal.*\.woff2$/,
  ];

  const preloads = patterns
    .map((pattern) => files.find((file) => pattern.test(file)))
    .filter(Boolean)
    .map(
      (file) =>
        `    <link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`,
    );

  if (preloads.length === 0) return html;
  return html.replace(
    '    <link rel="canonical"',
    `${preloads.join('\n')}\n    <link rel="canonical"`,
  );
}

function startDistServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname.slice(1));

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath);
        res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
        res.end(fs.readFileSync(filePath));
      } catch {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
    server.on('error', reject);
  });
}

const SITES_WORKER = `export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response('Static assets binding is unavailable.', { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return response;

    const fallbackUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
`;

function writeSitesArtifacts(distDir) {
  const serverDir = path.join(distDir, 'server');
  const metadataDir = path.join(distDir, '.openai');
  const hostingPath = path.resolve(__dirname, '.openai/hosting.json');

  fs.mkdirSync(serverDir, { recursive: true });
  fs.writeFileSync(path.join(serverDir, 'index.js'), SITES_WORKER);
  fs.mkdirSync(metadataDir, { recursive: true });
  if (fs.existsSync(hostingPath)) {
    fs.copyFileSync(hostingPath, path.join(metadataDir, 'hosting.json'));
  }
}

/**
 * Landing HTML pipeline (one source of truth — see docs/prerender.md):
 * - Authoring: React landing (`src/pages/landing/*`)
 * - Derived: `prerender/root.snapshot.html` (committed)
 * - Deploy/CI without Chromium: inject committed snapshot, then validate
 * - Local full build: Puppeteer regenerates snapshot + dist, then validate
 */
async function prerenderLandingPage(distDir) {
  const {
    SNAPSHOT_PATH,
    computeSourceFingerprint,
    injectSnapshotRoot,
    replaceRootHtml: replaceRoot,
    stampSnapshot,
    validatePrerenderHtml,
    validateSnapshotFile,
  } = await import('./scripts/validate-prerender.mjs');
  const { PRERENDER_READY_PHRASES } = await import('./src/pages/landing/prerenderContract.js');

  const useCommittedSnapshot = process.env.VERCEL === '1' || process.env.SKIP_PRERENDER === '1';

  if (useCommittedSnapshot) {
    const reason = process.env.VERCEL === '1' ? 'VERCEL=1' : 'SKIP_PRERENDER=1';
    console.info(`[pear] ${reason} — injecting committed prerender snapshot (no Puppeteer)`);
    await injectSnapshotRoot(distDir, SNAPSHOT_PATH);
    return;
  }

  const fingerprint = await computeSourceFingerprint();
  const puppeteer = await import('puppeteer');
  const { server, port } = await startDistServer(distDir);
  const [readyA, readyB] = PRERENDER_READY_PHRASES;

  try {
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

    await page.goto(`http://127.0.0.1:${port}/`, {
      waitUntil: 'networkidle0',
      timeout: 90_000,
    });

    await page.waitForSelector('[data-prerender-ready]', { timeout: 45_000 });
    await page.waitForFunction(
      (a, b) => {
        const text = document.getElementById('root')?.innerText || '';
        return text.includes(a) && text.includes(b);
      },
      { timeout: 45_000 },
      readyA,
      readyB,
    );
    await page.waitForSelector('#faq', { timeout: 45_000 });

    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => {
        window.setTimeout(resolve, 800);
      });
    });

    const rootHtml = await page.$eval('#root', (el) => el.innerHTML);
    if (!rootHtml.trim()) {
      throw new Error('[pear] prerender failed: #root innerHTML is empty');
    }
    await browser.close();

    const stamped = stampSnapshot(rootHtml, fingerprint);

    const indexPath = path.join(distDir, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    html = replaceRoot(html, stamped);
    fs.writeFileSync(indexPath, html);

    fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
    fs.writeFileSync(SNAPSHOT_PATH, stamped);

    await validatePrerenderHtml(stamped, {
      fingerprint,
      label: 'prerender/root.snapshot.html',
    });
    await validatePrerenderHtml(html, { fingerprint, label: 'dist/index.html' });

    console.info('[pear] prerendered / → dist/index.html + prerender/root.snapshot.html');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  // Ensure committed snapshot still matches the contract after write.
  await validateSnapshotFile(SNAPSHOT_PATH);
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-html-meta',
      transformIndexHtml(html) {
        return injectMeta(html);
      },
    },
    {
      name: 'pear-static-prerender',
      apply: 'build',
      closeBundle: {
        sequential: true,
        async handler() {
          if (!fs.existsSync(DIST_DIR)) return;

          const indexPath = path.join(DIST_DIR, 'index.html');
          let html = fs.readFileSync(indexPath, 'utf8');
          html = injectFontPreloads(html, DIST_DIR);
          fs.writeFileSync(indexPath, html);

          await prerenderLandingPage(DIST_DIR);
          writeSitesArtifacts(DIST_DIR);
        },
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      module: true,
      toplevel: true,
      compress: {
        passes: 3,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Rarely-changing vendor code → stable long-term browser caching across deploys.
        // NB: match by resolved path, not bare specifier. The array form only seeds package
        // *entry* modules (react-dom/index.js, gsap/index.js), which tree-shake away because the
        // app imports submodules (react-dom/client, gsap/ScrollTrigger) — the heavy code then
        // leaks back into the per-deploy main chunk. Path matching keeps it in the vendor chunk.
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            if (
              /\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)
            ) {
              return 'react';
            }
            if (/\/node_modules\/(gsap|@gsap\/react)\//.test(id)) {
              return 'gsap';
            }
            return undefined;
          }
          // Seasonal palette engine — shared by the boot theme sync and the lazy colors section.
          if (id.includes('/src/lib/seasonColors.js')) {
            return 'season';
          }
          return undefined;
        },
      },
    },
  },
});
