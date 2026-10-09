import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PEAR_EASE_GSAP, PEAR_EASE_WARM } from '@/constants/motion';

let registered = false;

/** CSS cubic-bezier → GSAP ease fn (same curve as Framer PEAR_EASE_WARM). */
function cubicBezierEase(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;

  return function ease(x) {
    if (x === 0 || x === 1) return x;
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) break;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return sampleY(t);
  };
}

const [warmX1, warmY1, warmX2, warmY2] = PEAR_EASE_WARM;
gsap.registerEase(PEAR_EASE_GSAP, cubicBezierEase(warmX1, warmY1, warmX2, warmY2));

export function ensureGsapRegistered() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
  registered = true;
}

export { gsap, ScrollTrigger };

/** Shared warm out — same bezier as PEAR_EASE_WARM / PEAR_TWEEN_ENTRANCE */
export const EASE = {
  out: PEAR_EASE_GSAP,
};

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
