import { ScrollTrigger } from '@/lib/gsap';
import { syncPageProgressAfterRefresh } from '@/lib/scroll/pageProgress';

let timeoutId = 0;
let pending = false;
let lastScrollAt = 0;

const SCROLL_SETTLE_MS = 200;

/** Scroll aktifken ST.refresh ertelenir — hero'da layout jump önlenir. */
export function markScrollActivity() {
  lastScrollAt = performance.now();
}

function runRefresh() {
  pending = false;
  ScrollTrigger.refresh();
  syncPageProgressAfterRefresh();
}

/** Debounced ScrollTrigger.refresh — lazy mount + resize tek seferde. */
export function scheduleScrollTriggerRefresh(delayMs = 220) {
  pending = true;
  window.clearTimeout(timeoutId);

  timeoutId = window.setTimeout(() => {
    const sinceScroll = performance.now() - lastScrollAt;
    if (sinceScroll < SCROLL_SETTLE_MS) {
      timeoutId = window.setTimeout(runRefresh, SCROLL_SETTLE_MS - sinceScroll);
      return;
    }
    runRefresh();
  }, delayMs);
}

export function isScrollTriggerRefreshPending() {
  return pending;
}
