import { ScrollTrigger } from '@/lib/gsap';

export const PAGE_PROGRESS_ID = 'pear-page-progress';

const LISTENERS = new Set();

let trigger = null;

function notify(progress, instance) {
  LISTENERS.forEach((fn) => fn(progress, instance));
}

/** Sayfa boyu tek ScrollTrigger — stem vb. doğrudan scroll progress ile abone olur. */
export function ensurePageProgressTrigger() {
  if (trigger) return trigger;

  trigger = ScrollTrigger.create({
    id: PAGE_PROGRESS_ID,
    trigger: document.body,
    start: 'top top',
    end: 'max',
    onUpdate(self) {
      notify(self.progress, trigger);
    },
  });

  notify(trigger.progress, trigger);
  return trigger;
}

export function syncPageProgressAfterRefresh() {
  if (!trigger) return;
  notify(trigger.progress, trigger);
}

export function getPageProgress() {
  return trigger?.progress ?? 0;
}

export function getPageProgressTrigger() {
  return trigger;
}

/** @param {(progress: number, instance: import('gsap/ScrollTrigger').ScrollTrigger) => void} listener */
export function subscribePageProgress(listener) {
  ensurePageProgressTrigger();
  LISTENERS.add(listener);
  if (trigger) listener(trigger.progress, trigger);
  return () => LISTENERS.delete(listener);
}

export function killPageProgressTrigger() {
  trigger?.kill();
  trigger = null;
  LISTENERS.clear();
}
