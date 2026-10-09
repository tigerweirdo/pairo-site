import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { CTA_HREF } from '@/components/layout/navLinks';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { BrandMarkIcon } from '@/components/brand/BrandMarkIcon';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { PEAR_DURATION_ENTRANCE, PEAR_OFFSET_Y, PEAR_STAGGER } from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';
import { trackEvent } from '@/lib/analytics';
import { ArrowRightIcon } from '@/icons/UiIcons';

ensureGsapRegistered();

export function FinalCTASection() {
  const sectionRef = useRef(null);
  const { eyebrow, titleLine1, titleAccent, sub, ctaPrimary, ctaSecondary, footnote } =
    LANDING_COPY.finalCTA;

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const reduce = prefersReducedMotion();
      if (reduce) {
        gsap.set('[data-final-card] > *', { opacity: 1, y: 0 });
        return;
      }

      gsap.set('[data-final-card] > *', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.to('[data-final-card] > *', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        stagger: PEAR_STAGGER,
        scrollTrigger: scrollRevealConfig({ trigger: sectionRef.current }),
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="cta" className="relative py-20 sm:py-28">
      <Container className="max-w-[520px]">
        <GlassCard
          data-final-card
          padding="p-8 sm:p-10"
          className="seasonal-down-glow rounded-[1.5rem] text-center"
        >
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-[hsl(var(--seasonal-primary)/0.14)] bg-[hsl(var(--seasonal-primary)/0.08)]">
            <BrandMarkIcon size={22} className="h-[22px] w-[22px]" />
          </div>

          <p
            data-final-eyebrow
            className="preserve-case text-[13px] font-medium tracking-[0.14em] text-[var(--seasonal-color-text)]"
          >
            {eyebrow}
          </p>

          <h2 className="mx-auto mt-3 max-w-[380px] text-[32px] font-bold leading-[1.12] tracking-tight text-foreground sm:text-[38px]">
            <span data-final-title-line1 className="block">
              {titleLine1}
            </span>
            <span
              data-final-title-line2
              className="text-brand-gradient mt-0.5 block transition-[background] duration-[var(--color-transition)]"
            >
              {titleAccent}
            </span>
          </h2>

          <p
            data-final-sub
            className="mx-auto mt-4 max-w-[400px] text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]"
            style={{ fontWeight: 400 }}
          >
            {sub}
          </p>

          <div data-final-cta className="mt-8">
            <NavAnchor
              href={CTA_HREF}
              className="inline-flex w-full"
              analytics={{ cta: 'try_pear', location: 'final' }}
            >
              <Button variant="primary" size="lg" className="w-full">
                {ctaPrimary}
                <ArrowRightIcon size={18} />
              </Button>
            </NavAnchor>
          </div>

          <p data-final-secondary className="mt-4 text-[14px] font-medium text-muted-foreground">
            {/* Inline text-link CTA that fires analytics, not navigation — intentional anchor styling. */}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href="#"
              className="rounded-sm text-[var(--seasonal-color-text)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={(event) => {
                event.preventDefault();
                trackEvent('CTA Click', { cta: 'ios_notify', location: 'final' });
              }}
            >
              {ctaSecondary}
            </a>
          </p>

          <p data-final-footnote className="mt-6 text-[12px] font-medium text-muted-foreground/80">
            {footnote}
          </p>
        </GlassCard>
      </Container>
    </section>
  );
}
