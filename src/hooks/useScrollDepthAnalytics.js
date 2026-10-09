import { useEffect, useRef } from 'react';
import { getScrollPercent, subscribeScroll } from '@/lib/scroll';
import { trackEvent } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100];
const SET_PIECE_ID = 'seasonal';
const SET_PIECE_KEY = 'set-piece';
const SET_PIECE_WAIT_FRAMES = 120;

export function useScrollDepthAnalytics() {
  const fired = useRef(new Set());

  useEffect(() => {
    const onScroll = () => {
      const pct = getScrollPercent();
      for (const milestone of MILESTONES) {
        if (pct >= milestone && !fired.current.has(milestone)) {
          fired.current.add(milestone);
          trackEvent('Scroll Depth', { depth: String(milestone) });
        }
      }
    };

    return subscribeScroll(onScroll);
  }, []);

  useEffect(() => {
    let observer;
    let rafId = null;
    let frame = 0;
    let cancelled = false;

    const observe = () => {
      if (cancelled || fired.current.has(SET_PIECE_KEY)) return;

      const el = document.getElementById(SET_PIECE_ID);
      if (!el) {
        frame += 1;
        if (frame < SET_PIECE_WAIT_FRAMES) {
          rafId = requestAnimationFrame(observe);
        }
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || entry.intersectionRatio < 0.35) return;
          if (fired.current.has(SET_PIECE_KEY)) return;
          fired.current.add(SET_PIECE_KEY);
          trackEvent('Set Piece Reached');
          observer?.disconnect();
        },
        { threshold: [0, 0.35] },
      );

      observer.observe(el);
    };

    observe();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);
}
