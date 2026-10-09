import { useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { SeasonProgressStrip } from '@/components/seasonal/SeasonProgressStrip';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { getSeasonProgress, resolveHemisphereSync } from '@/lib/seasonColors';
import {
  PEAR_DURATION_ENTRANCE,
  PEAR_DURATION_ENTRANCE_HEADING,
  PEAR_OFFSET_Y,
} from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

function seasonColorPhrase(date = new Date()) {
  const hemisphere = resolveHemisphereSync();
  const { dominantSeason, progress } = getSeasonProgress(date, hemisphere);
  const phase = progress < 0.35 ? 'early' : progress > 0.65 ? 'late' : 'mid';
  return `${phase} ${dominantSeason}`;
}

export function SeasonalColorsSection() {
  const sectionRef = useRef(null);
  const { eyebrow, title, subPrefix, subSuffix, scrubberLabel, seasonHints } =
    LANDING_COPY.seasonalSection;
  const seasonPhrase = useMemo(() => seasonColorPhrase(new Date()), []);
  const sub = `${subPrefix}${seasonPhrase}${subSuffix}`;
  const reduceMotion = prefersReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) {
        gsap.set(
          '[data-seasonal-eyebrow], [data-seasonal-title], [data-seasonal-sub], [data-seasonal-stage]',
          { opacity: 1, y: 0 },
        );
        return undefined;
      }

      gsap.set('[data-seasonal-eyebrow]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-seasonal-title]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-seasonal-sub]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-seasonal-stage]', { opacity: 0, y: PEAR_OFFSET_Y });

      const revealTl = gsap.timeline({
        scrollTrigger: scrollRevealConfig({ trigger: sectionRef.current }),
      });
      revealTl.to('[data-seasonal-eyebrow]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
      });
      revealTl.to(
        '[data-seasonal-title]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE_HEADING, ease: EASE.out },
        '-=0.28',
      );
      revealTl.to(
        '[data-seasonal-sub]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.32',
      );
      revealTl.to(
        '[data-seasonal-stage]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.28',
      );
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      id="seasonal"
      className="seasonal-climax relative pb-[clamp(5rem,18vh,12rem)]"
      data-reduced-motion={reduceMotion ? 'true' : undefined}
    >
      <div className="seasonal-climax__wash pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="seasonal-climax__wash-fade pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div className="seasonal-climax__vignette pointer-events-none absolute inset-0" aria-hidden />

      <div className="seasonal-climax__pin relative z-[1] flex min-h-0 flex-col justify-center px-4 py-12 sm:min-h-[100dvh] sm:px-6 sm:py-16">
        <Container className="relative z-[1] max-w-[920px]">
          <header className="text-center">
            <p data-seasonal-eyebrow className="section-eyebrow">
              {eyebrow}
            </p>
            <h2
              className="mx-auto max-w-[760px] overflow-hidden text-[clamp(2rem,5.5vw,3.25rem)] font-bold leading-[1.08] text-foreground"
              style={{ fontWeight: 700 }}
            >
              <span data-seasonal-title className="block">
                {title}
              </span>
            </h2>
            <p
              data-seasonal-sub
              className="mx-auto mt-4 max-w-[580px] text-[17px] leading-relaxed text-muted-foreground"
              style={{ fontWeight: 400 }}
            >
              {sub}
            </p>
          </header>

          <div
            data-seasonal-stage
            className="seasonal-climax__stage mx-auto mt-12 max-w-[720px] sm:mt-14"
          >
            <p className="mb-5 text-center text-xs font-medium text-[var(--seasonal-color-text)]">
              {scrubberLabel}
            </p>
            <SeasonProgressStrip embedded immersive showMonthLabels seasonHints={seasonHints} />
          </div>
        </Container>
      </div>

      <style>{`
        .seasonal-climax {
          --seasonal-fade-base: hsl(
            var(--seasonal-bg-h) calc(var(--seasonal-bg-s) * 1.06 * 1%) 98.2%
          );
        }
        .seasonal-climax__wash {
          background: var(--bg-accent-wash);
          opacity: 1;
          transition: opacity 0.4s ease;
        }
        .seasonal-climax__wash-fade {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            transparent 34%,
            color-mix(in srgb, var(--seasonal-fade-base) 8%, transparent) 52%,
            color-mix(in srgb, var(--seasonal-fade-base) 38%, transparent) 68%,
            color-mix(in srgb, var(--seasonal-fade-base) 72%, transparent) 82%,
            var(--seasonal-fade-base) 100%
          );
        }
        .seasonal-climax__vignette {
          background: radial-gradient(
            120% 85% at 50% 38%,
            transparent 42%,
            hsl(var(--seasonal-primary) / 0.07) 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            #000 0%,
            #000 48%,
            rgba(0, 0, 0, 0.45) 72%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            #000 0%,
            #000 48%,
            rgba(0, 0, 0, 0.45) 72%,
            transparent 100%
          );
        }
        .seasonal-climax__stage {
          padding: clamp(1.25rem, 3vw, 2rem);
          border-radius: 1.25rem;
          background: color-mix(in srgb, hsl(var(--card) / 0.72) 68%, transparent);
          border: 1px solid hsl(var(--seasonal-primary) / 0.12);
          box-shadow:
            0 0 0 1px hsl(var(--seasonal-primary) / 0.04),
            0 24px 64px -32px hsl(var(--seasonal-primary) / 0.22),
            0 48px 96px -48px hsl(var(--seasonal-primary) / 0.14);
          backdrop-filter: blur(14px);
        }
        @media (prefers-reduced-motion: reduce) {
          .seasonal-climax__pin {
            min-height: auto;
            padding-top: 5rem;
            padding-bottom: 5rem;
          }
        }
      `}</style>
    </section>
  );
}
