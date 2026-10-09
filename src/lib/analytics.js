const PLAUSIBLE_DOMAIN = 'getpairo.app';
const PLAUSIBLE_SRC = 'https://plausible.io/js/script.js';

let initStarted = false;

/** Prod-only, browser-only, skips Puppeteer prerender snapshots. */
export function canTrack() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    import.meta.env.PROD &&
    !navigator.webdriver
  );
}

/** Injects the Plausible script once — no cookies, no local storage. */
export function initPlausible() {
  if (!canTrack() || initStarted) return;
  initStarted = true;

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = PLAUSIBLE_SRC;
  document.head.appendChild(script);
}

/** Fires a custom goal; no-ops when tracking is disabled or script is absent. */
export function trackEvent(name, props = {}) {
  if (!canTrack()) return;

  const payload = Object.keys(props).length ? { props } : undefined;

  const send = () => {
    if (typeof window.plausible === 'function') {
      window.plausible(name, payload);
    }
  };

  if (typeof window.plausible === 'function') {
    send();
    return;
  }

  window.setTimeout(send, 1000);
}
