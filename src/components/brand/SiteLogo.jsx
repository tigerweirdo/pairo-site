import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { PearBrandMark } from '@/icons/PearBrandMark';
import { getCurrentSeason, resolveHemisphereSync } from '@/lib/seasonColors';
import { syncBrandTheme } from '@/lib/theme/syncBrandTheme';
import { setScrubberPreviewDate } from '@/lib/theme/scrubberPreview';
import { storageGetRaw, storageSetRaw, STORAGE_KEYS } from '@/lib/storage';

const SIZE_MAP = {
  sm: { container: 24, fontSize: 16, gap: 8 },
  md: { container: 40, fontSize: 26, gap: 14 },
  lg: { container: 60, fontSize: 38, gap: 20 },
  xl: { container: 80, fontSize: 52, gap: 26 },
};

const SEASON_ORDER = ['winter', 'spring', 'summer', 'autumn'];
const PEAK_DAYS_NORTH = { winter: 15, spring: 106, summer: 197, autumn: 288 };
const PEAK_DAYS_SOUTH = { summer: 15, autumn: 106, winter: 197, spring: 288 };
const EASTER_EGG_KEY = STORAGE_KEYS.MARK_EASTER_EGG;
const TRIPLE_CLICK_MS = 1400;

function resolveDimensions(size) {
  if (typeof size === 'number') {
    return { container: size, fontSize: size * 0.65, gap: size * 0.35 };
  }
  const preset = SIZE_MAP[size] ?? SIZE_MAP.md;
  return { container: preset.container, fontSize: preset.fontSize, gap: preset.gap };
}

function resolveMarkStyle(color) {
  if (color === 'white') return { color: '#ffffff' };
  if (color === 'seasonal') return { color: 'hsl(var(--seasonal-primary))' };
  return { color: 'currentColor' };
}

function previewDateForSeason(season) {
  const year = new Date().getFullYear();
  const peaks = resolveHemisphereSync() === 'south' ? PEAK_DAYS_SOUTH : PEAK_DAYS_NORTH;
  const date = new Date(year, 0, 1);
  date.setDate(peaks[season] ?? 106);
  return date;
}

function nextPeekSeasonIndex() {
  const today = getCurrentSeason(new Date(), resolveHemisphereSync());
  const todayIdx = SEASON_ORDER.indexOf(today);
  return todayIdx >= 0 ? (todayIdx + 2) % SEASON_ORDER.length : 0;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spawnPearConfetti() {
  if (prefersReducedMotion() || typeof document === 'undefined') return;

  const root = document.createElement('div');
  root.className = 'pear-confetti-root';
  root.setAttribute('aria-hidden', 'true');
  document.body.appendChild(root);

  for (let i = 0; i < 14; i += 1) {
    const bit = document.createElement('span');
    bit.className = 'pear-confetti-bit';
    bit.style.left = `${38 + Math.random() * 24}%`;
    bit.style.animationDelay = `${Math.random() * 0.12}s`;
    root.appendChild(bit);
  }

  window.setTimeout(() => root.remove(), 1100);
}

/** Marketing logo — reads live seasonal tokens from :root (updated by applySeasonalColors). */
export function SiteLogo({
  size = 'md',
  variant = 'full',
  className,
  color = 'seasonal',
  easterEggMark = false,
  /** Mark SVG px — wordmark `size` ile bağımsız (ör. header nav). */
  markSize,
}) {
  const { container, fontSize, gap } = resolveDimensions(size);
  const markStyle = resolveMarkStyle(color);
  const isSeasonal = color === 'seasonal';
  const isAppIcon = variant === 'app-icon';
  const markShellSize = markSize ?? container;
  const markGraphicSize = markSize ?? Math.round(container * (isAppIcon ? 0.64 : 0.88));
  const clickTimesRef = useRef([]);
  const hiddenSeasonIdxRef = useRef(nextPeekSeasonIndex());
  const [toastMessage, setToastMessage] = useState(null);
  const [tapPulse, setTapPulse] = useState(false);

  const triggerEasterEgg = useCallback(() => {
    const season = SEASON_ORDER[hiddenSeasonIdxRef.current % SEASON_ORDER.length];
    hiddenSeasonIdxRef.current += 1;
    setScrubberPreviewDate(previewDateForSeason(season));
    syncBrandTheme(new Date(), { instant: true });

    const firstTime = !storageGetRaw(EASTER_EGG_KEY);
    if (firstTime) {
      storageSetRaw(EASTER_EGG_KEY, '1');
      spawnPearConfetti();
      setToastMessage('made by two people who text too much.');
    } else {
      setToastMessage(`peek: ${season}`);
    }

    window.setTimeout(() => setToastMessage(null), firstTime ? 4200 : 2400);
  }, []);

  const handleMarkClick = useCallback(() => {
    if (!easterEggMark) return;

    setTapPulse(true);
    window.setTimeout(() => setTapPulse(false), 180);

    const now = Date.now();
    clickTimesRef.current = clickTimesRef.current.filter((t) => now - t < TRIPLE_CLICK_MS);
    clickTimesRef.current.push(now);

    if (clickTimesRef.current.length >= 3) {
      clickTimesRef.current = [];
      triggerEasterEgg();
    }
  }, [easterEggMark, triggerEasterEgg]);

  const wordmarkClassName = cn(
    'font-bold leading-none tracking-[0.04em]',
    isSeasonal && 'seasonal-text',
    variant === 'wordmark' ? className : '',
  );

  const wordmarkStyle = {
    fontFamily: "'Quicksand', sans-serif",
    fontSize,
    ...(color === 'white' ? { color: '#ffffff' } : {}),
    ...(color !== 'seasonal' && color !== 'white' ? { color: 'currentColor' } : {}),
  };

  const markGraphic = (
    <PearBrandMark
      size={markGraphicSize}
      backdrop={!isSeasonal}
      className={cn(
        !isAppIcon && isSeasonal && 'transition-[color] duration-[var(--color-transition,1.5s)]',
        tapPulse && 'interactive-mark--pulse',
      )}
      style={isAppIcon ? { color: '#1a1a18' } : markStyle}
    />
  );

  const toast =
    toastMessage && typeof document !== 'undefined'
      ? createPortal(
          <p className="pear-easter-toast" role="status">
            {toastMessage}
          </p>,
          document.body,
        )
      : null;

  if (variant === 'wordmark') {
    return (
      <>
        <div className={wordmarkClassName} style={wordmarkStyle}>
          pairo
        </div>
        {toast}
      </>
    );
  }

  const markShell = (
    <span
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: markShellSize, height: markShellSize }}
    >
      {markGraphic}
    </span>
  );

  const wordmark = (
    <span className={wordmarkClassName} style={wordmarkStyle}>
      pairo
    </span>
  );

  if (variant === 'icon' || variant === 'app-icon') {
    const mark = easterEggMark ? (
      <button
        type="button"
        className="interactive-mark interactive-mark--cluster"
        aria-label="pairo"
        onClick={handleMarkClick}
      >
        {markGraphic}
      </button>
    ) : (
      markGraphic
    );

    return (
      <>
        <div
          className={cn(
            'relative flex flex-shrink-0 items-center justify-center',
            isAppIcon && 'rounded-[22%] bg-white shadow-sm',
            className,
          )}
          style={{ width: container, height: container }}
        >
          {mark}
        </div>
        {toast}
      </>
    );
  }

  if (easterEggMark) {
    return (
      <>
        <button
          type="button"
          className={cn('interactive-mark interactive-mark--cluster', className)}
          style={{ gap }}
          aria-label="pairo — triple-click to peek seasons"
          onClick={handleMarkClick}
        >
          {markShell}
          {wordmark}
        </button>
        {toast}
      </>
    );
  }

  return (
    <>
      <div className={cn('inline-flex items-center', className)} style={{ gap }}>
        {markShell}
        {wordmark}
      </div>
      {toast}
    </>
  );
}
