import { scrollToTarget, SCROLL_HEADER_OFFSET } from '@/lib/scroll';

const SKIP_LINK_CLASS =
  'sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-3 focus-visible:top-3 focus-visible:z-[100] focus-visible:rounded-[var(--btn-radius)] focus-visible:border focus-visible:border-[hsl(var(--seasonal-primary))] focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:shadow-lg';

function activateSkipLink(event) {
  event.preventDefault();

  const main = document.getElementById('main');
  if (!main) return;

  scrollToTarget(main, { offset: -SCROLL_HEADER_OFFSET, immediate: true });

  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', '#main');
  }

  main.focus({ preventScroll: true });
}

export function PageShell({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main" className={SKIP_LINK_CLASS} onClick={activateSkipLink}>
        Skip to content
      </a>
      {children}
    </div>
  );
}
