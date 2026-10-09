import { useCallback, useRef, useState } from 'react';
import { useScrollPosition } from '@/lib/scroll';
import { SiteLogo } from '@/components/brand/SiteLogo';
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { NAV_LINKS } from '@/components/layout/navLinks';
import { PearPrimaryAction } from '@/components/ui/PearPrimaryAction';
import { MenuIcon } from '@/icons/UiIcons';
import { cn } from '@/lib/utils';

const SCROLL_SHADOW_THRESHOLD = 100;

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollStateRef = useRef({ scrolled: false });
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useScrollPosition((y) => {
    const nextScrolled = y > SCROLL_SHADOW_THRESHOLD;
    const prev = scrollStateRef.current;

    if (nextScrolled !== prev.scrolled) {
      prev.scrolled = nextScrolled;
      setScrolled(nextScrolled);
    }
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-2 z-50 px-3 sm:top-3 sm:px-4">
        <nav
          aria-label="Main navigation"
          className={cn(
            'mx-auto flex max-w-[1180px] items-center justify-between gap-2 border border-white/10 bg-[hsl(var(--foreground)/0.78)] px-3 py-2 text-white shadow-[0_12px_48px_hsl(var(--shadow-color)/0.18)] backdrop-blur-xl transition-[background-color,box-shadow] duration-300 sm:gap-3 sm:px-4 sm:py-2.5',
            scrolled &&
              'bg-[hsl(var(--foreground)/0.92)] shadow-[0_18px_58px_hsl(var(--shadow-color)/0.26)]',
          )}
        >
          <div className="flex items-center gap-2.5">
            <SiteLogo size={24} markSize={36} variant="icon" easterEggMark />
          </div>

          <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <NavAnchor
                key={href}
                href={href}
                className="text-xs font-semibold tracking-wide text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--foreground))]"
              >
                {label}
              </NavAnchor>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <PearPrimaryAction
              location="header"
              size="sm"
              className="hidden rounded-none sm:inline-flex"
            />

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--foreground))] md:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </nav>
      </header>

      <MobileNavDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
