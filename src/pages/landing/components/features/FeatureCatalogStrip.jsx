import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { GlassCard } from '@/components/ui/GlassCard';
import PearIcon from '@/icons/PearIcons';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { PEAR_DURATION_ENTRANCE, PEAR_OFFSET_Y, PEAR_STAGGER_TIGHT } from '@/constants/motion';
import { ensureGsapRegistered, gsap, ScrollTrigger, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

export function FeatureCatalogStrip() {
  const ref = useRef(null);
  const { eyebrow, items } = LANDING_COPY.featuresSection.alsoInside;

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const cards = gsap.utils.toArray('[data-catalog-item]');
      if (!cards.length) return;

      if (reduce) {
        gsap.set('[data-catalog-eyebrow]', { opacity: 1, y: 0 });
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }

      gsap.from('[data-catalog-eyebrow]', {
        opacity: 0,
        y: PEAR_OFFSET_Y,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        scrollTrigger: scrollRevealConfig({ trigger: ref.current }),
      });

      gsap.set(cards, { opacity: 0, y: PEAR_OFFSET_Y });
      ScrollTrigger.batch(cards, {
        ...scrollRevealConfig(),
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: PEAR_DURATION_ENTRANCE,
            ease: EASE.out,
            stagger: PEAR_STAGGER_TIGHT,
            overwrite: true,
          }),
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref}>
      <p data-catalog-eyebrow className="section-eyebrow mb-8 text-center">
        {eyebrow}
      </p>

      <ul className="mx-auto grid max-w-[720px] grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ icon, name }) => (
          <li key={name} data-catalog-item>
            <GlassCard
              padding="px-4 py-3.5"
              glow={false}
              className="flex items-center justify-center gap-2 text-center"
            >
              <PearIcon name={icon} size={18} className="h-[18px] w-[18px] shrink-0 opacity-80" />
              <p className="text-[13px] font-semibold text-foreground" style={{ fontWeight: 600 }}>
                {name}
              </p>
            </GlassCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
