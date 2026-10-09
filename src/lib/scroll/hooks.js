import { useCallback, useEffect } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SCROLL_HEADER_OFFSET } from '@/constants/scroll';
import { getScrollY, scrollToTarget, subscribeScroll } from '@/lib/scroll/engine';
import { subscribePageProgress } from '@/lib/scroll/pageProgress';

/**
 * Native scroll bus — one read per animation frame.
 * setState yalnızca değer değişince çağır (caller sorumluluğu).
 */
export function useScrollPosition(onScroll, deps = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let rafId = 0;

    const flush = () => {
      rafId = 0;
      onScroll(getScrollY());
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(flush);
    };

    const unsub = subscribeScroll(schedule);

    return () => {
      unsub();
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Sayfa boyu scroll progress (0–1) — tek pear-page-progress trigger. */
export function usePageProgress(onProgress, deps = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    return subscribePageProgress((progress) => onProgress(progress));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Hash and section links — native smooth scroll + header offset. */
export function useScrollTo() {
  const reduceMotion = usePrefersReducedMotion();

  return useCallback(
    (href, event) => {
      if (!href?.startsWith('#')) return;
      const id = href.slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event?.preventDefault();

      scrollToTarget(target, {
        offset: -SCROLL_HEADER_OFFSET,
        immediate: reduceMotion,
        duration: reduceMotion ? 0 : 1.2,
      });
    },
    [reduceMotion],
  );
}
