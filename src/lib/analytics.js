import posthog from 'posthog-js';

const POSTHOG_FALLBACK_KEY = 'phc_DfzHtLvcj3uawsACtsrgcFVyXVZYkW9FRpq3f2rYfMK5';
const POSTHOG_API_HOST = 'https://eu.i.posthog.com';

const APP_STORE_PATTERN =
  /^(https?:\/\/)?(apps\.apple\.com|itunes\.apple\.com|play\.google\.com)\//i;

let initStarted = false;
let posthogReady = false;

/** Prod-only, browser-only, skips Puppeteer prerender snapshots. */
export function canTrack() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    import.meta.env.PROD &&
    !navigator.webdriver
  );
}

function resolvePostHogKey() {
  const fromEnv = String(import.meta.env.VITE_POSTHOG_KEY ?? '').trim();
  return fromEnv || POSTHOG_FALLBACK_KEY;
}

/** Manual $pageview — autocapture is off; hash and history changes included. */
export function capturePageview() {
  if (!canTrack() || !posthogReady) return;
  posthog.capture('$pageview', {
    $current_url: window.location.href,
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
