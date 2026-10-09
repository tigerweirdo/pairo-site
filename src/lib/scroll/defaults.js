import { SCROLL_HEADER_OFFSET } from '@/constants/scroll';

export { SCROLL_HEADER_OFFSET };

/** Tek reveal çizgisi — erken/geç tetiklenmeyi önler. */
export const ST_START_REVEAL = 'top 86%';

/** Default native-scroll scrub band. */
export const ST_SCRUB_START = 'top bottom';
export const ST_SCRUB_END = 'bottom top';

/** ScrollTrigger config — native viewport scroller. */
export function scrollTriggerConfig(overrides = {}) {
  if (typeof window === 'undefined') {
    return { ...overrides };
  }
  return {
    scroller: window,
    ...overrides,
  };
}

/** Bölüm girişi — once, standart start. */
export function scrollRevealConfig(overrides = {}) {
  return scrollTriggerConfig({
    start: ST_START_REVEAL,
    once: true,
    ...overrides,
  });
}

/** Scroll scrub — scrub:true, directly mapped to native scroll. */
export function scrollScrubConfig(overrides = {}) {
  return scrollTriggerConfig({
    start: ST_SCRUB_START,
    end: ST_SCRUB_END,
    scrub: true,
    ...overrides,
  });
}
