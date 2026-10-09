import { ensureGsapRegistered, gsap, ScrollTrigger } from '@/lib/gsap';

let installed = false;

export function isScrollPerfProbeEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return (
      new URLSearchParams(window.location.search).has('pear_perf') ||
      window.localStorage.getItem('pear_perf') === '1'
    );
  } catch {
    return false;
  }
}

/**
 * Dev/prod diagnostic — enable with `?pear_perf=1` or `localStorage.pear_perf = '1'`.
 * Logs scroll + GSAP cost every 2s while you scroll.
 */
export function initScrollPerfProbe() {
  if (installed || !isScrollPerfProbeEnabled()) return;
  ensureGsapRegistered();
  installed = true;

  console.info(
    '%c[pear perf]%c probe active — scroll the page; summary every 2s.',
    'font-weight:700;color:#3d8b40',
    'color:inherit',
  );
  console.info('[pear perf] disable: localStorage.removeItem("pear_perf") or drop ?pear_perf=1');

  let stUpdates = 0;
  let onUpdateCalls = 0;
  let tickerTicks = 0;
  let longTasks = 0;

  const origUpdate = ScrollTrigger.update.bind(ScrollTrigger);
  ScrollTrigger.update = (...args) => {
    stUpdates += 1;
    return origUpdate(...args);
  };

  const origCreate = ScrollTrigger.create.bind(ScrollTrigger);
  ScrollTrigger.create = (vars = {}) => {
    if (typeof vars.onUpdate === 'function') {
      const orig = vars.onUpdate;
      vars.onUpdate = function wrappedOnUpdate(...args) {
        onUpdateCalls += 1;
        return orig.apply(this, args);
      };
    }
    return origCreate(vars);
  };

  gsap.ticker.add(() => {
    tickerTicks += 1;
  });

  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= 50) longTasks += 1;
        }
      });
      obs.observe({ entryTypes: ['longtask'] });
    } catch {
      /* longtask unsupported */
    }
  }

  window.setInterval(() => {
    const rows = {
      scrollTrigger_update_calls: stUpdates,
      onUpdate_callback_calls: onUpdateCalls,
      gsap_ticker_frames: tickerTicks,
      active_scroll_triggers: ScrollTrigger.getAll().length,
      long_tasks_over_50ms: longTasks,
    };
    console.table(rows);
    if (longTasks > 0) {
      console.warn('[pear perf] long tasks detected — open Performance panel while scrolling.');
    }
    stUpdates = 0;
    onUpdateCalls = 0;
    tickerTicks = 0;
    longTasks = 0;
  }, 2000);
}
