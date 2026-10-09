import {
  applySeasonalColors,
  computeSeasonalRootStyles,
  resolveHemisphereSync,
} from '../seasonColors.js';
import { SCRUBBER_MODIFIER_OPTS, getScrubberPreviewDate } from './scrubberPreview.js';

/**
 * Marketing site palette — stable seasonal color for a date (matches year scrubber).
 * Without this, time-of-day / weekly / special-day modifiers shift hue away from "today".
 */
const MARKETING_PALETTE_OPTS = SCRUBBER_MODIFIER_OPTS;

/** Inline script for first paint — avoids Vite PostCSS parsing a `<style>` block in index.html. */
export function buildMarketingBootScript(date = new Date(), hemisphere = 'north') {
  const { props } = computeSeasonalRootStyles(date, hemisphere, MARKETING_PALETTE_OPTS);
  const bootProps = { ...props, '--color-transition': '0s' };
  return `(function(){var p=${JSON.stringify(bootProps)};var s=document.documentElement.style;for(var k in p)if(Object.prototype.hasOwnProperty.call(p,k))s.setProperty(k,p[k]);var m=document.getElementById('theme-color-meta');if(m&&p['--seasonal-primary-hsl'])m.setAttribute('content',p['--seasonal-primary-hsl']);})();`;
}

/** Syncs seasonal CSS variables to today, or to the scrubber preview when dragging. */
export function syncBrandTheme(date = new Date(), options = {}) {
  const { instant = false } = options;
  const preview = getScrubberPreviewDate();
  const effectiveDate = preview ?? date;

  applySeasonalColors(effectiveDate, resolveHemisphereSync(), {
    ...MARKETING_PALETTE_OPTS,
    instant: instant || preview != null,
  });
}
