import { useScrollTo } from '@/lib/scroll';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const FOCUS_RING_CLASS =
  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** In-page hash link — native smooth scroll + CSS scroll-padding-top (reduced-motion: instant). */
export function NavAnchor({ href, className, children, onNavigate, analytics, ...rest }) {
  const scrollTo = useScrollTo();

  return (
    <a
      href={href}
      className={cn(FOCUS_RING_CLASS, className)}
      data-pear-tracked={analytics ? '1' : undefined}
      onClick={(event) => {
        if (analytics) {
          track('primary_cta_click', analytics);
        }
        scrollTo(href, event);
        onNavigate?.();
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
