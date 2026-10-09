import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MONTH_LABELS,
  clampPercent,
  dayOfYearToPercent,
  getDayOfYear,
  getPointerPercent,
  getSeasonMidPercents,
  getTotalDaysInYear,
  percentToDate,
  percentToDayOfYear,
} from './seasonProgressStrip.utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PEAR_DURATION_ENTRANCE } from '@/constants/motion';
import {
  SEASON_COLORS,
  applySeasonalColors,
  getCurrentSeason,
  getMeteorologicalBarSegments,
  getSeasonWeights,
  getSeasonalColorPalette,
  hslToHex,
  resolveHemisphereSync,
} from '@/lib/seasonColors';
import { ensureGsapRegistered, gsap, EASE } from '@/lib/gsap';
import { syncBrandTheme } from '@/lib/theme';
import {
  SCRUBBER_MODIFIER_OPTS,
  clearScrubberPreviewDate,
  setScrubberPreviewDate,
} from '@/lib/theme/scrubberPreview';

const SEASON_ORDER = ['winter', 'spring', 'summer', 'autumn'];
const CHIP_TWEEN_DURATION = PEAR_DURATION_ENTRANCE * 2.4;

ensureGsapRegistered();

function SeasonHintLabel({ children, active, reducedMotion }) {
  if (reducedMotion) {
    return (
      <span className="mt-0.5 text-[9px] font-medium normal-case tracking-normal opacity-60">
        {children}
      </span>
    );
  }

  return (
    <span
      className="mt-0.5 block text-[9px] font-medium normal-case tracking-normal transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity: active ? 1 : 0, transform: active ? 'scale(1)' : 'scale(0.9)' }}
    >
      {children}
    </span>
  );
}

function SeasonChip({ label, color, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background${
        active ? '' : ' opacity-70 hover:opacity-100'
      }`}
      style={{
        color,
        borderColor: `${color}44`,
        backgroundColor: active ? `${color}18` : 'transparent',
      }}
    >
      {label}
    </button>
  );
}

export function SeasonProgressStrip({
  embedded = false,
  immersive = false,
  showMonthLabels = false,
  seasonHints = null,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const now = new Date();
  const year = now.getFullYear();
  const totalDays = getTotalDaysInYear(year);
  const todayPct = dayOfYearToPercent(getDayOfYear(now), totalDays);

  const [activePct, setActivePct] = useState(todayPct);
  const [isDragging, setIsDragging] = useState(false);
  const [isTweening, setIsTweening] = useState(false);
  const barRef = useRef(null);
  const colorFrameRef = useRef(null);
  const pendingPercentRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragListenersRef = useRef(null);
  const pctTweenRef = useRef(null);
  const activePctRef = useRef(todayPct);
  const hemisphere = useMemo(() => resolveHemisphereSync(), []);

  const segments = useMemo(() => {
    let start = 0;
    return getMeteorologicalBarSegments(year, hemisphere).map((segment) => {
      const width = (segment.days / totalDays) * 100;
      const bounds = { start, end: start + width, width };
      start += width;
      return {
        ...segment,
        ...bounds,
        color: hslToHex(
          SEASON_COLORS[segment.key].primary.h,
          SEASON_COLORS[segment.key].primary.s,
          SEASON_COLORS[segment.key].primary.l,
        ),
      };
    });
  }, [hemisphere, totalDays, year]);

  const releaseDragListeners = useCallback(() => {
    const listeners = dragListenersRef.current;
    if (!listeners) return;
    window.removeEventListener('mousemove', listeners.move);
    window.removeEventListener('mouseup', listeners.up);
    window.removeEventListener('touchmove', listeners.move);
    window.removeEventListener('touchend', listeners.up);
    window.removeEventListener('touchcancel', listeners.up);
    dragListenersRef.current = null;
  }, []);

  const applyColorsAt = useCallback(
    (percent) => {
      if (percent == null || Number.isNaN(percent)) return;
      const clamped = clampPercent(percent);
      const isTodayPosition = Math.abs(clamped - todayPct) < 1;

      if (isTodayPosition) {
        clearScrubberPreviewDate();
        syncBrandTheme();
        return;
      }

      const date = percentToDate(clamped, year, totalDays);
      setScrubberPreviewDate(date);
      applySeasonalColors(date, resolveHemisphereSync(), {
        ...SCRUBBER_MODIFIER_OPTS,
        instant: true,
      });
    },
    [todayPct, totalDays, year],
  );

  const queueColorPreview = useCallback(
    (percent) => {
      pendingPercentRef.current = percent;
      if (colorFrameRef.current != null) return;
      colorFrameRef.current = requestAnimationFrame(() => {
        colorFrameRef.current = null;
        applyColorsAt(pendingPercentRef.current);
      });
    },
    [applyColorsAt],
  );

  const previewAt = useCallback(
    (percent, { updateColors = true } = {}) => {
      const clamped = clampPercent(percent);
      activePctRef.current = clamped;
      setActivePct(clamped);
      if (updateColors) queueColorPreview(clamped);
    },
    [queueColorPreview],
  );

  const killPctTween = useCallback(() => {
    if (pctTweenRef.current) {
      pctTweenRef.current.kill();
      pctTweenRef.current = null;
      setIsTweening(false);
    }
  }, []);

  const animateToPercent = useCallback(
    (percent, { updateColors = true } = {}) => {
      const target = clampPercent(percent);
      const from = activePctRef.current;

      if (Math.abs(target - from) < 0.4) {
        previewAt(target, { updateColors });
        return;
      }

      if (reducedMotion) {
        previewAt(target, { updateColors });
        return;
      }

      killPctTween();
      setIsTweening(true);
      const state = { pct: from };
      pctTweenRef.current = gsap.to(state, {
        pct: target,
        duration: CHIP_TWEEN_DURATION,
        ease: EASE.out,
        onUpdate: () => {
          previewAt(state.pct, { updateColors });
        },
        onComplete: () => {
          pctTweenRef.current = null;
          setIsTweening(false);
        },
      });
    },
    [killPctTween, previewAt, reducedMotion],
  );

  const selectSeason = useCallback(
    (percent) => {
      animateToPercent(percent);
    },
    [animateToPercent],
  );

  const seasonMidPercents = useMemo(
    () => getSeasonMidPercents(totalDays, hemisphere),
    [hemisphere, totalDays],
  );

  const setDayOfYear = useCallback(
    (day, { animate = false } = {}) => {
      const clampedDay = Math.max(1, Math.min(day, totalDays));
      const pct = dayOfYearToPercent(clampedDay, totalDays);
      if (animate) {
        animateToPercent(pct);
        return;
      }
      previewAt(pct);
    },
    [animateToPercent, previewAt, totalDays],
  );

  const finishDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    releaseDragListeners();

    if (colorFrameRef.current != null) {
      cancelAnimationFrame(colorFrameRef.current);
      colorFrameRef.current = null;
    }

    // Keep thumb + palette on the chosen day (preview persists until page leave).
    if (pendingPercentRef.current != null) {
      applyColorsAt(pendingPercentRef.current);
    }
    pendingPercentRef.current = null;
  }, [applyColorsAt, releaseDragListeners]);

  const onPointerMove = useCallback(
    (event) => {
      if (!isDraggingRef.current) return;
      event.preventDefault();
      previewAt(getPointerPercent(event, barRef.current));
    },
    [previewAt],
  );

  const onPointerDown = useCallback(
    (event) => {
      event.preventDefault();
      killPctTween();
      isDraggingRef.current = true;
      setIsDragging(true);
      previewAt(getPointerPercent(event, barRef.current));

      releaseDragListeners();
      const move = (e) => onPointerMove(e);
      const up = () => finishDrag();
      dragListenersRef.current = { move, up };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', up);
      window.addEventListener('touchcancel', up);
    },
    [finishDrag, killPctTween, onPointerMove, previewAt, releaseDragListeners],
  );

  const onKeyDown = useCallback(
    (event) => {
      const currentDay = percentToDayOfYear(activePct, totalDays);
      let nextDay = currentDay;
      let animate = false;

      switch (event.key) {
        case 'ArrowLeft':
          nextDay = currentDay - 1;
          break;
        case 'ArrowRight':
          nextDay = currentDay + 1;
          break;
        case 'ArrowUp':
          nextDay = currentDay - 7;
          break;
        case 'ArrowDown':
          nextDay = currentDay + 7;
          break;
        case 'Home':
          nextDay = 1;
          animate = true;
          break;
        case 'End':
          nextDay = totalDays;
          animate = true;
          break;
        default:
          return;
      }

      event.preventDefault();
      killPctTween();
      setDayOfYear(nextDay, { animate });
    },
    [activePct, killPctTween, setDayOfYear, totalDays],
  );

  useEffect(() => {
    clearScrubberPreviewDate();
    syncBrandTheme(new Date(), { instant: true });

    return () => {
      killPctTween();
      releaseDragListeners();
      if (colorFrameRef.current != null) {
        cancelAnimationFrame(colorFrameRef.current);
      }
      clearScrubberPreviewDate();
      syncBrandTheme(new Date(), { instant: true });
    };
  }, [killPctTween, releaseDragListeners]);

  const previewDate = percentToDate(activePct, year, totalDays);
  const activeSeasonKey = useMemo(
    () => getCurrentSeason(previewDate, hemisphere),
    [hemisphere, previewDate],
  );
  const seasonWeights = useMemo(
    () => getSeasonWeights(previewDate, hemisphere),
    [hemisphere, previewDate],
  );
  const barGradient = useMemo(() => {
    const stops = [];
    segments.forEach((segment, index) => {
      stops.push(`${segment.color} ${segment.start}%`);
      if (index < segments.length - 1) {
        stops.push(`${segments[index + 1].color} ${segment.end}%`);
      } else {
        stops.push(`${segment.color} ${segment.end}%`);
      }
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [segments]);
  const activeColor = useMemo(() => {
    const primary = getSeasonalColorPalette(previewDate, hemisphere).colors.primary;
    return hslToHex(primary.h, primary.s, primary.l);
  }, [hemisphere, previewDate]);
  const currentDayOfYear = percentToDayOfYear(activePct, totalDays);
  const isToday = Math.abs(activePct - todayPct) < 1;
  const dateLabel = isToday
    ? 'Today'
    : `${MONTH_LABELS[previewDate.getMonth()]} ${previewDate.getDate()}`;
  const showReducedChips = immersive && reducedMotion;

  return (
    <div className={embedded ? '' : 'border-seasonal-primary/10 mt-5 border-t pt-5'}>
      {showReducedChips ? (
        <div
          className="mb-5 flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Jump to a season"
        >
          {seasonMidPercents.map(({ key, label, percent }) => (
            <SeasonChip
              key={key}
              label={label}
              color={segments.find((s) => s.key === key)?.color ?? activeColor}
              active={activeSeasonKey === key}
              onSelect={() => selectSeason(percent)}
            />
          ))}
        </div>
      ) : null}

      <div className={`relative select-none px-1${showReducedChips ? '' : ' touch-none'}`}>
        <div className="mb-1.5 flex">
          {segments.map((segment) => (
            <span
              key={segment.id}
              className="flex flex-col items-center text-center"
              style={{ width: `${segment.width}%`, color: segment.color }}
            >
              <span className="preserve-case text-[10px] font-medium tracking-wide opacity-70">
                {segment.label}
              </span>
              {seasonHints?.[segment.key] ? (
                <SeasonHintLabel
                  active={activeSeasonKey === segment.key}
                  reducedMotion={reducedMotion}
                >
                  {seasonHints[segment.key]}
                </SeasonHintLabel>
              ) : null}
            </span>
          ))}
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Scrub the year to preview pairo's seasonal palette"
          aria-valuemin={1}
          aria-valuemax={totalDays}
          aria-valuenow={currentDayOfYear}
          aria-valuetext={dateLabel}
          aria-busy={isTweening || isDragging}
          onKeyDown={onKeyDown}
          className={`relative rounded-lg py-2.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background${
            showReducedChips ? '' : ' cursor-grab touch-none active:cursor-grabbing'
          }`}
          onMouseDown={showReducedChips ? undefined : onPointerDown}
          onTouchStart={showReducedChips ? undefined : onPointerDown}
        >
          <div ref={barRef} className="relative h-2.5 max-w-full">
            <div
              className="relative h-full overflow-hidden rounded-full shadow-inner"
              style={{ background: barGradient }}
              aria-hidden
            >
              {SEASON_ORDER.map((key) => {
                const segment = segments.find((s) => s.key === key);
                if (!segment) return null;
                const weight = seasonWeights[key] ?? 0;
                return (
                  <div
                    key={key}
                    className={`absolute inset-y-0${reducedMotion ? '' : ' transition-opacity duration-200 ease-out'}`}
                    style={{
                      left: `${segment.start}%`,
                      width: `${segment.width}%`,
                      backgroundColor: segment.color,
                      opacity: 0.14 + weight * 0.78,
                    }}
                  />
                );
              })}
            </div>

            <div
              className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${activePct}%` }}
            >
              <div
                className={`rounded-full border-[2.5px] shadow-md${
                  reducedMotion
                    ? ''
                    : ' transition-[transform,box-shadow,background-color] duration-200 ease-out'
                }${isDragging ? ' scale-[1.22]' : ' scale-100'}`}
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: activeColor,
                  borderColor: 'hsl(var(--card))',
                  boxShadow: isDragging
                    ? `0 0 20px ${activeColor}aa, 0 8px 20px -4px ${activeColor}55`
                    : `0 0 12px ${activeColor}88, 0 4px 12px -2px ${activeColor}44`,
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none relative mt-1.5 w-fit -translate-x-1/2"
          style={{ left: `${activePct}%` }}
        >
          <span
            className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-semibold${reducedMotion ? '' : ' transition-colors duration-150'}`}
            style={{ color: activeColor, backgroundColor: `${activeColor}15` }}
          >
            {dateLabel}
          </span>
        </div>

        {showMonthLabels ? (
          <div className="mt-4 hidden grid-cols-12 gap-1 sm:grid">
            {MONTH_LABELS.map((month) => (
              <span key={month} className="text-center text-[10px] text-muted-foreground">
                {month}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
