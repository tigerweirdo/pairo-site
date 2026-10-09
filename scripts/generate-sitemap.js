import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SITE_URL, SITEMAP_PATHS } from '../src/constants/site.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
const lastmod = new Date().toISOString().slice(0, 10);

const urlEntries = SITEMAP_PATHS.map((pathname) => {
  const loc = pathname === '/' ? `${siteUrl}/` : `${siteUrl}${pathname}`;
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

if (!fs.existsSync(DIST_DIR)) {
  console.warn('[pear] dist/ missing — sitemap skipped');
  process.exit(0);
}

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
console.info('[pear] wrote sitemap.xml → dist/');
