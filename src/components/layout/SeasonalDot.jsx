import { useState } from 'react';
import { getCurrentSeason, resolveHemisphereSync } from '@/lib/seasonColors';
import { cn } from '@/lib/utils';

const SIZE_MAP = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
};

export function getCurrentSeasonForDate(date = new Date()) {
  return getCurrentSeason(date, resolveHemisphereSync());
}

export function SeasonalDot({
  size = 'sm',
  showLabel = false,
  showHoverPreview = false,
  className,
  ...rest
}) {
  const season = getCurrentSeasonForDate(new Date());
  const [hovered, setHovered] = useState(false);
  const preview = showHoverPreview && hovered ? `the app is currently themed for ${season}` : null;

  return (
    <span
      className={cn('relative inline-flex items-center gap-1.5', className)}
      onMouseEnter={
        showHoverPreview
          ? () => {
              if (
                typeof window !== 'undefined' &&
                window.matchMedia('(hover: hover) and (pointer: fine)').matches
              ) {
                setHovered(true);
              }
            }
          : undefined
      }
      onMouseLeave={showHoverPreview ? () => setHovered(false) : undefined}
      {...rest}
    >
      {preview ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground/90 px-2 py-1 text-[12px] font-medium text-background opacity-100 transition-opacity duration-200 motion-reduce:transition-none"
          style={{ fontWeight: 500 }}
        >
          {preview}
        </span>
      ) : null}
      <span
        className={cn(
          'shrink-0 animate-seasonal-dot-pulse rounded-full transition-[background-color,box-shadow] duration-[1500ms] ease-in-out motion-reduce:animate-none',
          SIZE_MAP[size] ?? SIZE_MAP.sm,
        )}
        style={{
          backgroundColor: 'hsl(var(--seasonal-primary))',
          boxShadow: '0 0 8px hsl(var(--seasonal-primary) / 0.5)',
        }}
        aria-hidden={showLabel}
      />
      {showLabel ? (
        <span
          className="text-[12px] font-medium capitalize text-muted-foreground"
          style={{ fontWeight: 500 }}
        >
          {season}
        </span>
      ) : null}
    </span>
  );
}
