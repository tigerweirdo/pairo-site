import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { PEAR_DURATION_ENTRANCE, PEAR_OFFSET_Y, PEAR_OFFSET_Y_SM } from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

export function PrivacySection() {
  const sectionRef = useRef(null);
  const { title, body, linkLabel } = LANDING_COPY.privacySection;

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      if (reduce) {
        gsap.set('[data-privacy-title], [data-privacy-body], [data-privacy-link]', {
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.set('[data-privacy-title]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-privacy-body]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-privacy-link]', { opacity: 0, y: PEAR_OFFSET_Y_SM });

      const tl = gsap.timeline({
        scrollTrigger: scrollRevealConfig({ trigger: sectionRef.current }),
      });
      tl.to('[data-privacy-title]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
      });
      tl.to(
        '[data-privacy-body]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.28',
      );
      tl.to(
        '[data-privacy-link]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.24',
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="privacy" className="py-20 sm:py-24">
      <Container className="max-w-[640px] text-center">
        <h2 className="preserve-case overflow-hidden text-[32px] font-bold leading-[1.12] text-foreground sm:text-[40px]">
          <span data-privacy-title className="block">
            {title}
          </span>
        </h2>
        <p
          data-privacy-body
          className="preserve-case mt-5 text-[17px] leading-relaxed text-muted-foreground"
          style={{ fontWeight: 400 }}
        >
          {body}
        </p>
        {/* Placeholder anchor pending the published privacy-policy URL. */}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          href="#"
          data-privacy-link
          className="preserve-case mt-6 inline-block rounded-sm text-[14px] font-medium text-[var(--seasonal-color-text)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {linkLabel}
        </a>
      </Container>
    </section>
  );
}
