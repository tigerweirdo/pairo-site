import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { GlassCard } from '@/components/ui/GlassCard';
import PearIcon from '@/icons/PearIcons';
import { PEAR_DURATION_ENTRANCE, PEAR_OFFSET_Y, PEAR_STAGGER } from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

export function FeatureGrid({ blocks }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const cards = gsap.utils.toArray('[data-feature-card]');
      if (!cards.length) return;

      if (reduce) {
        gsap.set(cards, { opacity: 1, y: 0 });
        gsap.set('[data-feature-icon]', { opacity: 1, scale: 1, rotate: 0 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-feature-icon]', { opacity: 0, scale: 0.92 });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        stagger: PEAR_STAGGER,
        scrollTrigger: scrollRevealConfig({ trigger: ref.current }),
      });

      gsap.to('[data-feature-icon]', {
        opacity: 1,
        scale: 1,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        stagger: PEAR_STAGGER,
        scrollTrigger: scrollRevealConfig({ trigger: ref.current }),
      });
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      {blocks.map((block) => (
        <li key={block.id} data-feature-card className="h-full min-h-0">
          <GlassCard
            padding="p-6 sm:p-7"
            className={`flex h-full flex-col text-left ${
              block.isLead
                ? 'border-[hsl(var(--seasonal-primary)/0.24)] bg-[hsl(var(--seasonal-primary)/0.07)] shadow-[0_0_40px_-12px_hsl(var(--seasonal-primary)/0.35)]'
                : ''
            }`}
          >
            <span
              data-feature-icon
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[hsl(var(--seasonal-primary)/0.18)] bg-[hsl(var(--seasonal-primary)/0.10)]"
              aria-hidden
            >
              <PearIcon name={block.icon} size={22} className="h-[22px] w-[22px]" />
            </span>

            <p className="preserve-case mt-5 text-[11px] font-semibold tracking-[0.15em] text-[var(--seasonal-color-text)]">
              {block.label}
            </p>

            <h3 className="mt-2 text-[20px] font-bold leading-[1.2] text-foreground sm:text-[22px]">
              {block.name}
            </h3>

            <p
              className="mt-2 text-[15px] leading-snug text-muted-foreground"
              style={{ fontWeight: 400 }}
            >
              {block.description}
            </p>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
