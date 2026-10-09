/**
 * Pear brand mark paths — shared by favicon.svg and scripts/generate-og.js.
 * Keep in sync with src/icons/pearMarkPaths.js (node scripts/sync-pear-mark-paths.js).
 */
import {
  PEAR_MARK_BACKDROP_RADIUS,
  PEAR_MARK_FRAME_SCALE,
  PEAR_MARK_LAYERS,
  PEAR_MARK_VIEWBOX_HEIGHT,
  PEAR_MARK_VIEWBOX_WIDTH,
  VIEWBOX_CENTER_X,
  VIEWBOX_CENTER_Y,
} from '../src/icons/pearMarkPaths.js';

export { PEAR_MARK_FRAME_SCALE };

/** Favicon viewBox — daire kareye tam otursun (Google/OpenAI gibi edge-to-edge). */
const FAVICON_CROP_PADDING = 1.0;

/** Header (0.94) yerine sekmede daha büyük görünsün. */
const FAVICON_MARK_FRAME_SCALE = 0.98;

/** Kare favicon köşe yuvarlaklığı (side oranı — app icon / sekme stili). */
const FAVICON_CORNER_RADIUS_RATIO = 0.2;

function pearMarkPaths({ fill = '#1a1a18', detailFill = '#ffffff' } = {}) {
  return PEAR_MARK_LAYERS.map(({ d, role }) => {
    const layerFill = role === 'main' ? fill : detailFill;
    return `<path fill="${layerFill}" d="${d}"/>`;
  }).join('\n      ');
}

function pearMarkBackdrop(cx, cy) {
  return `<circle cx="${cx}" cy="${cy}" r="${PEAR_MARK_BACKDROP_RADIUS}" fill="#ffffff"/>`;
}

export function pearMarkGroup(markStyle, { backdrop = false } = {}) {
  const cx = VIEWBOX_CENTER_X;
  const cy = VIEWBOX_CENTER_Y;
  return `
    <g transform="translate(${cx} ${cy}) scale(${PEAR_MARK_FRAME_SCALE}) translate(${-cx} ${-cy})">
      ${backdrop ? `${pearMarkBackdrop(cx, cy)}\n      ` : ''}${pearMarkPaths(markStyle)}
    </g>
  `;
}

function centeredMarkSvg({ width, height, background, markFill, markStyle, backdrop = false }) {
  const cx = VIEWBOX_CENTER_X;
  const cy = VIEWBOX_CENTER_Y;
  const markSize = Math.min(width, height) * markFill;
  const scale = markSize / Math.max(PEAR_MARK_VIEWBOX_WIDTH, PEAR_MARK_VIEWBOX_HEIGHT);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${background}
  <g transform="translate(${width / 2} ${height / 2}) scale(${scale}) translate(${-cx} ${-cy})">
    ${pearMarkGroup(markStyle, { backdrop })}
  </g>
</svg>`;
}

export function buildAppIconSvg({ width, height, markFill = 0.84 }) {
  return centeredMarkSvg({
    width,
    height,
    markFill,
    background: `<rect width="${width}" height="${height}" fill="#ffffff" />`,
    markStyle: { fill: '#1a1a18', detailFill: '#ffffff' },
    backdrop: true,
  });
}

export function buildShareImageSvg({ width, height, colorMain, colorDark, markFill = 0.5 }) {
  return centeredMarkSvg({
    width,
    height,
    markFill,
    background: `<defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorMain}" />
      <stop offset="100%" stop-color="${colorDark}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />`,
    markStyle: { fill: '#1a1a18', detailFill: '#ffffff' },
    backdrop: true,
  });
}

function faviconPearMarkGroup(markStyle) {
  const cx = VIEWBOX_CENTER_X;
  const cy = VIEWBOX_CENTER_Y;
  return `
    <g transform="translate(${cx} ${cy}) scale(${FAVICON_MARK_FRAME_SCALE}) translate(${-cx} ${-cy})">
      ${pearMarkBackdrop(cx, cy)}
      ${pearMarkPaths(markStyle)}
    </g>
  `;
}

export function buildFaviconSvg({ size = 32 } = {}) {
  const cx = VIEWBOX_CENTER_X;
  const cy = VIEWBOX_CENTER_Y;
  const side = PEAR_MARK_BACKDROP_RADIUS * 2 * FAVICON_CROP_PADDING;
  const originX = cx - side / 2;
  const originY = cy - side / 2;
  const cornerRadius = side * FAVICON_CORNER_RADIUS_RATIO;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${originX} ${originY} ${side} ${side}" width="${size}" height="${size}">
  <defs>
    <clipPath id="favicon-clip">
      <rect x="${originX}" y="${originY}" width="${side}" height="${side}" rx="${cornerRadius}" ry="${cornerRadius}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#favicon-clip)">
    <rect x="${originX}" y="${originY}" width="${side}" height="${side}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/>
    ${faviconPearMarkGroup({ fill: '#1a1a18', detailFill: '#ffffff' }).trim()}
  </g>
</svg>`;
}
