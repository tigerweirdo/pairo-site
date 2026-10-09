import { useCallback, useId, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ChevronDownIcon } from '@/icons/UiIcons';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function Accordion({
  items,
  allowMultiple = false,
  staggerEntrance = false,
  isInView = true,
  entranceTransition,
  className,
}) {
  const baseId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = useCallback(
    (id) => {
      setOpenIds((prev) => {
        if (allowMultiple) {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }
        return prev.has(id) ? new Set() : new Set([id]);
      });
    },
    [allowMultiple],
  );

  // Framer's transition objects took seconds; CSS delays are ms.
  const baseDelayMs = (entranceTransition?.delay ?? 0) * 1000;

  return (
    <div className={cn(className)}>
      {items.map(({ id, question, answer }, index) => {
        const isOpen = openIds.has(id);
        const triggerId = `${baseId}-trigger-${id}`;
        const panelId = `${baseId}-panel-${id}`;

        const itemContent = (
          <div className="border-b border-[hsl(var(--seasonal-primary)/0.10)] last:border-b-0">
            <h3 className="m-0">
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(id)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 py-5 text-left',
                  'transition-colors hover:bg-[hsl(var(--seasonal-primary)/0.04)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                <span className="text-base font-semibold text-foreground">{question}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: reduceMotion ? 'none' : `transform 250ms ${EASE}`,
                  }}
                >
                  <ChevronDownIcon size={20} className="h-5 w-5" aria-hidden="true" />
                </span>
              </button>
            </h3>

            {/* grid-template-rows 0fr→1fr animates height with no JS measurement. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="grid"
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                opacity: isOpen ? 1 : 0,
                transition: reduceMotion
                  ? 'none'
                  : `grid-template-rows 250ms ${EASE}, opacity 250ms ${EASE}`,
              }}
            >
              <div className="overflow-hidden">
                <p
                  className="max-w-[640px] pb-5 pt-2 text-[15px] leading-relaxed text-muted-foreground"
                  style={{ fontWeight: 400 }}
                >
                  {answer}
                </p>
              </div>
            </div>
          </div>
        );

        if (!staggerEntrance) {
          return <div key={id}>{itemContent}</div>;
        }

        const revealed = reduceMotion || isInView;
        return (
          <div
            key={id}
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'none' : 'translateY(12px)',
              transition: reduceMotion
                ? 'none'
                : `opacity 350ms ${EASE} ${baseDelayMs + index * 30}ms, transform 350ms ${EASE} ${baseDelayMs + index * 30}ms`,
            }}
          >
            {itemContent}
          </div>
        );
      })}
    </div>
  );
}
