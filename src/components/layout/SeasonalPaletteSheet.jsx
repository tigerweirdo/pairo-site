import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAnimatedPresence } from '@/hooks/useAnimatedPresence';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { getCurrentSeasonForDate } from '@/components/layout/SeasonalDot';
import { GlassCard } from '@/components/ui/GlassCard';
import { XIcon } from '@/icons/UiIcons';
import {
  getCurrentSeason,
  getSeasonalColorPalette,
  hslToHex,
  resolveHemisphereSync,
} from '@/lib/seasonColors';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const MONTHS = [
  { short: 'Jan', month: 0 },
  { short: 'Feb', month: 1 },
  { short: 'Mar', month: 2 },
  { short: 'Apr', month: 3 },
  { short: 'May', month: 4 },
  { short: 'Jun', month: 5 },
  { short: 'Jul', month: 6 },
  { short: 'Aug', month: 7 },
  { short: 'Sep', month: 8 },
  { short: 'Oct', month: 9 },
  { short: 'Nov', month: 10 },
  { short: 'Dec', month: 11 },
];

const SPECIAL_DAYS = [
  { month: 1, day: 14, label: "Valentine's" },
  { month: 8, day: 23, label: 'Autumn equinox' },
  { month: 11, day: 31, label: "New Year's Eve" },
  { month: 2, day: 21, label: 'Spring equinox' },
];

function monthSampleDate(month, year) {
  return new Date(year, month, 15);
}

function getPrimaryHex(date) {
  const { colors } = getSeasonalColorPalette(date, resolveHemisphereSync());
  return hslToHex(colors.primary.h, colors.primary.s, colors.primary.l);
}

function formatSpecialDay({ month, day, label }, year) {
  const date = new Date(year, month, day);
  const monthShort = MONTHS[month].short;
  return { date, text: `${monthShort} ${day} — ${label}` };
}

function MonthCard({ month, year, isCurrentMonth }) {
  const date = monthSampleDate(month, year);
  const primaryHex = getPrimaryHex(date);
  const season = getCurrentSeason(date, resolveHemisphereSync());

  return (
    <GlassCard
      glow={false}
      padding="p-4"
      className={`flex aspect-[4/3] flex-col items-center justify-between rounded-xl text-center ${
        isCurrentMonth
          ? 'bg-[hsl(var(--seasonal-primary)/0.06)] ring-2 ring-[var(--seasonal-color-main)]'
          : ''
      }`}
      style={{ backgroundColor: isCurrentMonth ? undefined : `${primaryHex}14` }}
    >
      <p className="text-[12px] font-semibold text-foreground" style={{ fontWeight: 600 }}>
        {MONTHS[month].short}
      </p>
      <span
        className="h-12 w-12 shrink-0 rounded-full shadow-md"
        style={{ backgroundColor: primaryHex, boxShadow: `0 4px 16px ${primaryHex}55` }}
        aria-hidden
      />
      <p className="text-[10px] capitalize text-muted-foreground" style={{ fontWeight: 500 }}>
        {season}
      </p>
    </GlassCard>
  );
}

export function SeasonalPaletteSheet({ open, onClose }) {
  const reduceMotion = usePrefersReducedMotion();
  const duration = reduceMotion ? 0 : 320;
  const { render, visible } = useAnimatedPresence(open, { duration });
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const season = getCurrentSeasonForDate(new Date());
  const titleId = 'seasonal-palette-sheet-title';

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!render) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close seasonal palette preview"
        className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transition: reduceMotion ? 'none' : `opacity ${duration}ms ${EASE}`,
        }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed bottom-0 left-0 right-0 z-[90] max-h-[80vh] overflow-y-auto rounded-t-[var(--radius)] border-t border-[hsl(var(--seasonal-primary)/0.13)] bg-background p-6 sm:mx-auto sm:max-w-[680px] sm:p-8"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: reduceMotion ? 'none' : `transform ${duration}ms ${EASE}`,
        }}
      >
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-foreground/20" aria-hidden />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)]"
          aria-label="Close seasonal palette preview"
        >
          <XIcon size={16} className="h-4 w-4" />
        </button>

        <header className="mb-8 pr-10">
          <h2
            id={titleId}
            className="text-[24px] font-bold capitalize text-foreground"
            style={{ fontWeight: 700 }}
          >
            Today is {season}.
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground" style={{ fontWeight: 400 }}>
            Your app, and this page, are themed for it. Here&apos;s the full year.
          </p>
        </header>

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {MONTHS.map(({ month }) => (
            <li key={month}>
              <MonthCard month={month} year={year} isCurrentMonth={month === currentMonth} />
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="mb-2 text-[13px] font-semibold text-foreground" style={{ fontWeight: 600 }}>
            Some days have their own palette:
          </p>
          <ul className="space-y-2">
            {SPECIAL_DAYS.map((day) => {
              const { date, text } = formatSpecialDay(day, year);
              const color = getPrimaryHex(date);
              return (
                <li
                  key={text}
                  className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground"
                  style={{ fontWeight: 500 }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>,
    document.body,
  );
}
