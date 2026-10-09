export {
  initScrollEngine,
  destroyScrollEngine,
  getLenis,
  isScrollEngineActive,
  getScrollY,
  getScrollPercent,
  subscribeScroll,
  scrollToTarget,
} from '@/lib/scroll/engine';

export {
  PAGE_PROGRESS_ID,
  ensurePageProgressTrigger,
  getPageProgress,
  getPageProgressTrigger,
  subscribePageProgress,
  syncPageProgressAfterRefresh,
  killPageProgressTrigger,
} from '@/lib/scroll/pageProgress';

export {
  markScrollActivity,
  scheduleScrollTriggerRefresh,
  isScrollTriggerRefreshPending,
} from '@/lib/scroll/refresh';

export {
  SCROLL_HEADER_OFFSET,
  ST_START_REVEAL,
  ST_SCRUB_START,
  ST_SCRUB_END,
  scrollTriggerConfig,
  scrollRevealConfig,
  scrollScrubConfig,
} from '@/lib/scroll/defaults';

export { useScrollPosition, usePageProgress, useScrollTo } from '@/lib/scroll/hooks';
