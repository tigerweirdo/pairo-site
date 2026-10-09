import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { GlassCard } from '@/components/ui/GlassCard';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import {
  PEAR_DURATION_ENTRANCE,
  PEAR_OFFSET_Y,
  PEAR_OFFSET_Y_SM,
  PEAR_STAGGER,
} from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

export function HowPairingWorksSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const targets =
        '[data-pairing-eyebrow], [data-pairing-title], [data-pairing-sub], [data-pairing-card], [data-pairing-link]';

      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: 'transform' });
        return undefined;
      }

      gsap.set('[data-pairing-eyebrow], [data-pairing-title], [data-pairing-sub]', {
        opacity: 0,
        y: PEAR_OFFSET_Y,
      });
      gsap.set('[data-pairing-card]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-pairing-link]', { opacity: 0, y: PEAR_OFFSET_Y_SM });

      const tl = gsap.timeline({
        scrollTrigger: scrollRevealConfig({
          trigger: sectionRef.current,
          start: 'top 84%',
        }),
      });

      tl.to('[data-pairing-eyebrow]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
      })
        .to(
          '[data-pairing-title]',
          {
            opacity: 1,
            y: 0,
            duration: PEAR_DURATION_ENTRANCE,
            ease: EASE.out,
          },
          `-=${PEAR_STAGGER * 3}`,
        )
        .to(
          '[data-pairing-sub]',
          {
            opacity: 1,
            y: 0,
            duration: PEAR_DURATION_ENTRANCE,
            ease: EASE.out,
          },
          `-=${PEAR_STAGGER * 2}`,
        )
        .to(
          '[data-pairing-card]',
          {
            opacity: 1,
            y: 0,
            duration: PEAR_DURATION_ENTRANCE,
            ease: EASE.out,
            stagger: PEAR_STAGGER,
          },
          '-=0.2',
        )
        .to(
          '[data-pairing-link]',
          {
            opacity: 1,
            y: 0,
            duration: PEAR_DURATION_ENTRANCE,
            ease: EASE.out,
          },
          '-=0.16',
        );

      return undefined;
    },
    { scope: sectionRef },
  );

  const { eyebrow, title, sub, steps, privacyLink } = LANDING_COPY.pairing;

  return (
    <section
      ref={sectionRef}
      className="relative -mt-[clamp(5rem,18vh,12rem)] overflow-hidden pb-24 pt-[clamp(7rem,22vh,14rem)] sm:pb-28"
      aria-label={eyebrow}
    >
      <Container className="relative z-[1] max-w-[1080px]">
        <header className="mb-12 text-center sm:mb-14">
          <p data-pairing-eyebrow className="section-eyebrow mb-0">
            {eyebrow}
          </p>

          <h2 className="mx-auto mt-4 max-w-[640px] text-[36px] font-bold leading-tight text-foreground md:text-[44px]">
            <span data-pairing-title className="block">
              {title}
            </span>
          </h2>

          <p
            data-pairing-sub
            className="mx-auto mt-3 max-w-[540px] text-[17px] leading-relaxed text-muted-foreground"
            style={{ fontWeight: 400 }}
          >
            {sub}
          </p>
        </header>

        <ol className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {steps.map(({ number, title: stepTitle, description }) => (
            <li key={number} data-pairing-card>
              <GlassCard glow={false} padding="p-6" className="h-full text-center">
                <div
                  className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--seasonal-primary)/0.12)]"
                  aria-hidden
                >
                  <span className="text-lg font-bold text-[var(--seasonal-color-text)]">
                    {number}
                  </span>
                </div>
                <h3 className="mt-4 text-[17px] font-semibold text-foreground">{stepTitle}</h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-muted-foreground"
                  style={{ fontWeight: 400 }}
                >
                  {description}
                </p>
              </GlassCard>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center sm:mt-12">
          <NavAnchor
            href="#privacy"
            data-pairing-link
            className="rounded-sm text-sm font-semibold text-[var(--seasonal-color-text)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {privacyLink}
          </NavAnchor>
        </p>
      </Container>
    </section>
  );
}
