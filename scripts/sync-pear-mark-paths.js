/**
 * pear-icon.svg → src/icons/pearMarkPaths.js
 * Run: node scripts/sync-pear-mark-paths.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'src/icons/pear-icon.svg');
const outPath = path.join(root, 'src/icons/pearMarkPaths.js');

const svg = fs.readFileSync(svgPath, 'utf8');
const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
if (!vb) throw new Error('viewBox not found in pear-icon.svg');

const width = Number(vb[1]);
const height = Number(vb[2]);
const matches = [...svg.matchAll(/<path\s+([^>]+)\/>/g)];

const layers = matches.map((m) => {
  const attrs = m[1];
  const d = attrs.match(/d="([^"]+)"/)?.[1];
  const fill = attrs.match(/fill="([^"]+)"/)?.[1];
  if (!d || !fill) throw new Error('path missing d or fill');
  return { d, role: fill === '#000000' || fill === '#1a1a18' ? 'main' : 'detail' };
});

const out = `/**
 * pear mark path data — tek kaynak (PearBrandMark, favicon, OG).
 * Kaynak: src/icons/pear-icon.svg — güncellemek için: node scripts/sync-pear-mark-paths.js
 */

export const PEAR_MARK_VIEWBOX_WIDTH = ${width};
export const PEAR_MARK_VIEWBOX_HEIGHT = ${height};
export const PEAR_MARK_FRAME_SCALE = 0.94;
export const PEAR_MARK_BACKDROP_RADIUS =
  (Math.min(PEAR_MARK_VIEWBOX_WIDTH, PEAR_MARK_VIEWBOX_HEIGHT) / 2) * 0.94;

export const VIEWBOX_CENTER_X = PEAR_MARK_VIEWBOX_WIDTH / 2;
export const VIEWBOX_CENTER_Y = PEAR_MARK_VIEWBOX_HEIGHT / 2;

export const PEAR_MARK_LAYERS = ${JSON.stringify(layers, null, 2)};
`;

fs.writeFileSync(outPath, out);
console.log(`Synced ${layers.length} layers (${width}×${height}) → src/icons/pearMarkPaths.js`);
