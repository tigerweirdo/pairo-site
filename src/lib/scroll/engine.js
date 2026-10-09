import { ensureGsapRegistered, ScrollTrigger } from '@/lib/gsap';
import { ensurePageProgressTrigger } from '@/lib/scroll/pageProgress';
import { markScrollActivity, scheduleScrollTriggerRefresh } from '@/lib/scroll/refresh';

const SCROLL_LISTENERS = new Set();

let teardown = null;
let scrollRafId = 0;
let resizeObserver = null;

function readScrollY() {
  return window.scrollY ?? document.documentElement.scrollTop;
}

function emitScroll() {
  scrollRafId = 0;
  const y = readScrollY();
  SCROLL_LISTENERS.forEach((fn) => fn(y));
}

function scheduleScrollEmit() {
  if (scrollRafId) return;
  scrollRafId = requestAnimationFrame(emitScroll);
}

function onScrollerUpdate() {
  markScrollActivity();
  ScrollTrigger.update();
  scheduleScrollEmit();
}

function setupResizeRefresh() {
  let lastHeight = document.body.scrollHeight;
  resizeObserver = new ResizeObserver(() => {
    const height = document.body.scrollHeight;
    if (Math.abs(height - lastHeight) < 48) return;
    lastHeight = height;
    scheduleScrollTriggerRefresh();
  });
  resizeObserver.observe(document.body);
}

/** Native scroll + ScrollTrigger — tek giriş noktası. main.jsx React mount öncesi çağırır. */
export function initScrollEngine() {
  if (typeof window === 'undefined') return;
  if (teardown) return;

  ensureGsapRegistered();
  ScrollTrigger.defaults({ scroller: window });
  window.addEventListener('scroll', onScrollerUpdate, { passive: true });

  ensurePageProgressTrigger();
  setupResizeRefresh();
  ScrollTrigger.refresh();
  scheduleScrollEmit();

  teardown = () => {
    if (scrollRafId) cancelAnimationFrame(scrollRafId);
    SCROLL_LISTENERS.clear();
    resizeObserver?.disconnect();
    resizeObserver = null;

    window.removeEventListener('scroll', onScrollerUpdate);

    teardown = null;
  };
}

export function destroyScrollEngine() {
  teardown?.();
}

export function getLenis() {
  return null;
}

export function isScrollEngineActive() {
  return Boolean(teardown);
}

export function getScrollY() {
  return readScrollY();
}

export function getScrollPercent() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.min(100, Math.round((readScrollY() / docHeight) * 100));
}

/** Native scroll tick — header and analytics share one requestAnimationFrame bus. */
export function subscribeScroll(listener) {
  SCROLL_LISTENERS.add(listener);
  listener(readScrollY());
  return () => SCROLL_LISTENERS.delete(listener);
}

/**
 * Hash / section scroll — native behavior with the shared header offset.
 * @param {Element|string|number} target
 * @param {{ offset?: number, immediate?: boolean, duration?: number }} [options]
 */
export function scrollToTarget(target, options = {}) {
  const { offset = 0, immediate = false } = options;

  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el instanceof Element) {
    const top = el.getBoundingClientRect().top + readScrollY() + offset;
    window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
  }
}
