import { useEffect, useRef } from 'react';
import { useAnimatedPresence } from '@/hooks/useAnimatedPresence';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { NAV_LINKS } from '@/components/layout/navLinks';
import { PearPrimaryAction } from '@/components/ui/PearPrimaryAction';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function MobileNavDrawer({ open, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const duration = reduceMotion ? 0 : 320;
  const { render, visible } = useAnimatedPresence(open, { duration });

  useEffect(() => {
    if (!open || !render) return undefined;

    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose, render]);

  const handleLinkClick = () => {
    onClose();
  };

  if (!render) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[60] bg-foreground/70 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--seasonal-primary)/0.7)] md:hidden"
        style={{
          opacity: visible ? 1 : 0,
          transition: reduceMotion ? 'none' : `opacity ${duration}ms ${EASE}`,
        }}
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-h-[70vh] border-t border-white/15 bg-[hsl(var(--foreground))] p-6 text-white md:hidden"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: reduceMotion ? 'none' : `transform ${duration}ms ${EASE}`,
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close menu"
          className="mx-auto mb-5 block w-12 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--foreground))]"
          onClick={onClose}
        >
          <span className="block h-px w-12 bg-white/30" />
        </button>

        <nav aria-label="Mobile navigation" className="flex flex-col">
          {NAV_LINKS.map(({ label, href }) => (
            <NavAnchor
              key={href}
              href={href}
              onNavigate={handleLinkClick}
              className="border-b border-white/10 py-4 text-sm font-semibold tracking-wide text-white/70 transition-colors hover:text-[hsl(var(--seasonal-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--foreground))]"
            >
              {label}
            </NavAnchor>
          ))}
        </nav>

        <PearPrimaryAction
          location="drawer"
          size="lg"
          className="mt-5 flex w-full rounded-none"
          onAction={handleLinkClick}
        />
      </div>
    </>
  );
}
