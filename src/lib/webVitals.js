import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { canTrack, trackEvent } from '@/lib/analytics';

/** CLS is a unitless ratio — scale to an integer so Plausible breakdowns stay readable. */
function toInteger(name, value) {
  return String(Math.round(name === 'CLS' ? value * 1000 : value));
}

/** One Plausible goal per metric, tagged with web-vitals' good/needs-improvement/poor rating. */
function report({ name, value, rating }) {
  trackEvent('Web Vitals', { metric: name, rating, value: toInteger(name, value) });
}

/**
 * Streams Core Web Vitals (+ FCP/TTFB) to Plausible as custom events.
 * No-op outside production / inside the prerender crawler — guarded by canTrack().
 */
export function initWebVitals() {
  if (!canTrack()) return;

  onCLS(report);
  onINP(report);
  onLCP(report);
  onFCP(report);
  onTTFB(report);
}
