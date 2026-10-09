import { useMediaQuery } from '@/hooks/useMediaQuery';

/** Boolean prefers-reduced-motion — drop-in replacement for framer's useReducedMotion. */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
