/**
 * PWA icons from Pear brand mark (same paths as favicon.svg).
 * The curated story-led OG card is committed at public/og.png and is preserved.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';
import { buildAppIconSvg, buildFaviconSvg } from './brandMarkSvg.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'public/icons');
const publicDir = path.join(root, 'public');

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  return resvg.render().asPng();
}

function main() {
  fs.mkdirSync(iconsDir, { recursive: true });

  const ogPath = path.join(publicDir, 'og.png');
  if (!fs.existsSync(ogPath)) {
    throw new Error('Missing curated social card: public/og.png');
  }

  const icon192Svg = buildAppIconSvg({ width: 192, height: 192 });
  const icon512Svg = buildAppIconSvg({ width: 512, height: 512 });
  const faviconSvg = buildFaviconSvg({ size: 32 });

  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), renderPng(icon192Svg, 192));
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), renderPng(icon512Svg, 512));
  fs.writeFileSync(path.join(publicDir, 'favicon-16.png'), renderPng(faviconSvg, 16));
  fs.writeFileSync(path.join(publicDir, 'favicon-32.png'), renderPng(faviconSvg, 32));
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

  console.log('Preserved curated og.png; generated app icons + favicon.svg + favicon-16/32.png');
}

main();
