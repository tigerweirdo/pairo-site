import posthog from 'posthog-js';

const POSTHOG_FALLBACK_KEY = 'phc_DfzHtLvcj3uawsACtsrgcFVyXVZYkW9FRpq3f2rYfMK5';
const POSTHOG_API_HOST = 'https://eu.i.posthog.com';

/** PostHog yalnızca bu hostname'lerde etkinleştirilir (CI/Lighthouse/localhost hariç). */
export const POSTHOG_TRACKING_HOSTNAMES = Object.freeze(['getpairo.app', 'www.getpairo.app']);

/** Aynı URL için ardışık $pageview yakalamalarını birleştirir (ms). */
export const PAGEVIEW_DEDUPE_MS = 250;

const APP_STORE_PATTERN =
  /^(https?:\/\/)?(apps\.apple\.com|itunes\.apple\.com|play\.google\.com)\//i;

let initStarted = false;
let posthogReady = false;
let lastPageviewHref = '';
let lastPageviewAt = 0;

export function isPostHogTrackingHostname(hostname) {
  return POSTHOG_TRACKING_HOSTNAMES.includes(String(hostname ?? '').trim());
}

/**
 * @param {Pick<ImportMetaEnv, 'PROD'>} [env]
 * @param {{ location?: { hostname?: string } } | null | undefined} [win]
 * @param {{ webdriver?: boolean } | null | undefined} [nav]
 * @param {unknown} [doc]
 */
export function shouldEnablePostHogTracking(
  env = import.meta.env,
  win = typeof window !== 'undefined' ? window : undefined,
  nav = typeof navigator !== 'undefined' ? navigator : undefined,
  doc = typeof document !== 'undefined' ? document : undefined,
) {
  if (!doc) return false;
  if (!env?.PROD) return false;
  if (nav?.webdriver) return false;
  const hostname = win?.location?.hostname;
  if (!hostname) return false;
  return isPostHogTrackingHostname(hostname);
}

/** @param {string} href @param {number} nowMs */
export function shouldDedupePageview(
  href,
  nowMs,
  previousHref = lastPageviewHref,
  previousAt = lastPageviewAt,
) {
  return href === previousHref && nowMs - previousAt < PAGEVIEW_DEDUPE_MS;
}

/** Prod-only, allowlisted host, skips Puppeteer / Lighthouse (webdriver). */
export function canTrack() {
  return shouldEnablePostHogTracking();
}

function resolvePostHogKey() {
  const fromEnv = String(import.meta.env.VITE_POSTHOG_KEY ?? '').trim();
  return fromEnv || POSTHOG_FALLBACK_KEY;
}

/** Manual $pageview — autocapture is off; hash and history changes included. */
export function capturePageview() {
  if (!canTrack() || !posthogReady) return;

  const href = window.location.href;
  const now = Date.now();
  if (shouldDedupePageview(href, now)) return;

  lastPageviewHref = href;
  lastPageviewAt = now;

  posthog.capture('$pageview', {
    $current_url: href,
  });
}

function isExternalHref(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }
  try {
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function setupOutboundClickTracking() {
  document.addEventListener(
    'click',
    (event) => {
      if (!canTrack() || !posthogReady) return;

      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.dataset.pearTracked === '1') return;

      const href = anchor.getAttribute('href') || '';
      if (!isExternalHref(href)) return;

      if (APP_STORE_PATTERN.test(href)) {
        track('app_store_click', {
          href,
          label: anchor.textContent?.trim().slice(0, 80) ?? '',
        });
        return;
      }

      track('outbound_click', {
        href,
        label: anchor.textContent?.trim().slice(0, 80) ?? '',
      });
    },
    true,
  );
}

function setupPageviewListeners() {
  window.addEventListener('popstate', capturePageview);
  window.addEventListener('hashchange', capturePageview);
}

/** PostHog EU — memory persistence, no cookies, DNT respected. */
export function initPostHog() {
  if (!canTrack() || initStarted) return;
  initStarted = true;

  posthog.init(resolvePostHogKey(), {
    api_host: POSTHOG_API_HOST,
    persistence: 'memory',
    autocapture: false,
    disable_session_recording: true,
    respect_dnt: true,
    capture_pageview: false,
    capture_pageleave: false,
    loaded: (client) => {
      posthogReady = true;
      client.register({ project_slug: 'pairo' });
      capturePageview();
    },
  });

  setupPageviewListeners();
  setupOutboundClickTracking();
}

/** Capture a custom event; no-ops when tracking is disabled or PostHog is not ready. */
export function track(event, props = {}) {
  if (!canTrack()) return;

  const send = () => {
    if (posthogReady) {
      posthog.capture(event, props);
    }
  };

  if (posthogReady) {
    send();
    return;
  }

  window.setTimeout(send, 1000);
}

/** @deprecated Prefer `track` — kept for existing call sites during migration. */
export function trackEvent(name, props = {}) {
  track(name, props);
}

/** @internal Test-only reset for module state. */
export function __resetAnalyticsStateForTests() {
  initStarted = false;
  posthogReady = false;
  lastPageviewHref = '';
  lastPageviewAt = 0;
}
