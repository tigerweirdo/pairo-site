import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { FeatureCatalogStrip } from '@/pages/landing/components/features/FeatureCatalogStrip';
import { FeatureGrid } from '@/pages/landing/components/features/FeatureGrid';
import { FEATURE_BLOCKS, LANDING_COPY } from '@/pages/landing/landing.content';
import {
  PEAR_DURATION_ENTRANCE,
  PEAR_DURATION_ENTRANCE_HEADING,
  PEAR_OFFSET_Y,
  PEAR_STAGGER,
} from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const { eyebrow, titleLine1, titleLine2, sub } = LANDING_COPY.featuresSection;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.set('[data-features-title-line1], [data-features-title-line2]', {
        opacity: 0,
        y: PEAR_OFFSET_Y,
      });
      gsap.set('[data-features-eyebrow]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-features-sub]', { opacity: 0, y: PEAR_OFFSET_Y });

      const tl = gsap.timeline({
        scrollTrigger: scrollRevealConfig({ trigger: '[data-features-header]' }),
      });
      tl.to('[data-features-eyebrow]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
      });
      tl.to(
        '[data-features-title-line1], [data-features-title-line2]',
        {
          opacity: 1,
          y: 0,
          duration: PEAR_DURATION_ENTRANCE_HEADING,
          ease: EASE.out,
          stagger: PEAR_STAGGER,
        },
        '-=0.28',
      );
      tl.to(
        '[data-features-sub]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.32',
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="features" className="scroll-mt-24 py-24 sm:py-32">
      <Container className="max-w-[1180px]">
        <header data-features-header className="mb-10 text-center sm:mb-12">
          <p data-features-eyebrow className="section-eyebrow">
            {eyebrow}
          </p>
          <h2
            className="mx-auto max-w-[640px] text-[36px] font-bold leading-[1.08] text-foreground sm:text-[48px] md:text-[52px]"
            style={{ fontWeight: 700 }}
          >
            <span className="block overflow-hidden">
              <span data-features-title-line1 className="block">
                {titleLine1}
              </span>
            </span>
            {titleLine2 ? (
              <span className="block overflow-hidden">
                <span data-features-title-line2 className="block">
                  {titleLine2}
                </span>
              </span>
            ) : null}
          </h2>
          {sub ? (
            <p
              data-features-sub
              className="mx-auto mt-4 max-w-[520px] text-[17px] leading-relaxed text-muted-foreground sm:text-lg"
              style={{ fontWeight: 400 }}
            >
              {sub}
            </p>
          ) : null}
        </header>

        <FeatureGrid blocks={FEATURE_BLOCKS} />

        <div className="mt-20 border-t border-[hsl(var(--seasonal-primary)/0.08)] pt-16 sm:mt-24 sm:pt-20">
          <FeatureCatalogStrip />
        </div>
      </Container>
    </section>
  );
}
