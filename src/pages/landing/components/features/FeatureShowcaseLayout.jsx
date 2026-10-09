import { cn } from '@/lib/utils';
import PearIcon from '@/icons/PearIcons';

/** Sticky header offset — top gap + floating nav bar (keeps Spark tab visible). */
export const FEATURES_STICKY_TOP = '5.75rem';

export function tabShortName(label) {
  const part = label.split('·').pop()?.trim() ?? label;
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

/**
 * Desktop: compact icon rail. Mobile: horizontal chips with label.
 */
export function FeatureTabRail({ blocks, activeId, onSelect, className, tabProps = {} }) {
  const interactive = typeof onSelect === 'function';

  return (
    <div
      role="tablist"
      aria-label="pairo features"
      aria-orientation={interactive ? 'vertical' : undefined}
      className={cn(
        'flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'lg:w-[4.75rem] lg:shrink-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:pb-0',
        className,
      )}
    >
      {blocks.map((block) => {
        const selected = block.id === activeId;
        const shortName = tabShortName(block.label);
        const sharedClass = cn(
          'flex shrink-0 items-center rounded-[var(--btn-radius)] border text-left transition-colors',
          'gap-2.5 px-3.5 py-2.5',
          'lg:h-12 lg:w-12 lg:justify-center lg:gap-0 lg:px-0 lg:py-0',
          selected
            ? 'border-[hsl(var(--seasonal-primary)/0.32)] bg-[hsl(var(--seasonal-primary)/0.10)] text-foreground shadow-[0_4px_24px_hsl(var(--seasonal-primary)/0.10)]'
            : 'border-[hsl(var(--seasonal-primary)/0.10)] bg-[hsl(var(--seasonal-primary)/0.03)] text-muted-foreground',
          !selected &&
            interactive &&
            'hover:border-[hsl(var(--seasonal-primary)/0.2)] hover:bg-[hsl(var(--seasonal-primary)/0.06)] hover:text-foreground',
          !interactive && !selected && 'opacity-55',
          interactive &&
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        );

        const icon = (
          <span
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl border lg:h-10 lg:w-10',
              selected
                ? 'border-[hsl(var(--seasonal-primary)/0.25)] bg-[hsl(var(--seasonal-primary)/0.12)]'
                : 'border-[hsl(var(--seasonal-primary)/0.12)] bg-[hsl(var(--seasonal-primary)/0.06)]',
            )}
          >
            <PearIcon name={block.icon} size={18} className="h-[18px] w-[18px]" />
          </span>
        );

        const label = (
          <span className="min-w-0 pr-1 lg:hidden">
            <span className="block text-[15px] font-semibold leading-tight">{shortName}</span>
          </span>
        );

        if (interactive) {
          return (
            <button
              key={block.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`feature-tab-${block.id}`}
              aria-controls={`feature-panel-${block.id}`}
              title={block.label}
              onClick={() => onSelect(block.id)}
              className={cn(sharedClass, 'lg:w-full')}
              {...tabProps}
            >
              {icon}
              {label}
            </button>
          );
        }

        return (
          <div
            key={block.id}
            role="tab"
            aria-selected={selected}
            title={block.label}
            className={cn(sharedClass, 'pointer-events-none lg:w-full')}
            {...tabProps}
          >
            {icon}
            {label}
          </div>
        );
      })}
    </div>
  );
}

export function FeatureShowcaseGrid({ children, className }) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)] lg:items-start lg:gap-x-16 lg:gap-y-10',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Side-by-side tab rail + copy on desktop; stacked on mobile. */
export function FeatureShowcaseLeftColumn({ tabs, panel, className }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-8',
        'lg:flex-row lg:items-start lg:gap-10 xl:gap-12',
        className,
      )}
    >
      {tabs}
      <div className="min-w-0 flex-1 lg:pt-1">{panel}</div>
    </div>
  );
}

export function FeatureCopyPanel({ children, className, id, labelledBy }) {
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative max-w-[540px]', className)}
    >
      {children}
    </div>
  );
}

export function FeatureCopyBody({ eyebrow, title, description, bullets }) {
  const eyebrowNode =
    typeof eyebrow === 'string' ? (
      <p className="preserve-case text-[11px] font-semibold tracking-[0.15em] text-[var(--seasonal-color-text)]">
        {eyebrow}
      </p>
    ) : (
      eyebrow
    );

  return (
    <>
      {eyebrowNode}
      <h3 className="mt-5 text-[26px] font-bold leading-[1.14] text-foreground sm:text-[32px] sm:leading-[1.12]">
        {title}
      </h3>
      <p
        className="mt-5 max-w-[480px] text-[17px] leading-[1.65] text-muted-foreground"
        style={{ fontWeight: 400 }}
      >
        {description}
      </p>
      <ul className="mt-8 flex max-w-[500px] flex-col gap-3.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <span
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--seasonal-primary))]"
              aria-hidden
            />
            <span className="text-[15px] font-medium leading-[1.55] text-foreground/85">
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function FeatureMockColumn({ children, className }) {
  return (
    <div className={cn('mx-auto w-full max-w-[400px] lg:mx-0 lg:max-w-none lg:pt-1', className)}>
      {children}
    </div>
  );
}
