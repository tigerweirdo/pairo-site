import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { CTA_HREF } from '@/components/layout/navLinks';
import { Button } from '@/components/ui/Button';
import { PearWordMorph } from '@/components/brand/PearWordMorph';
import { HeroPhoneMock } from '@/pages/landing/components/HeroPhoneMock';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollScrubConfig } from '@/lib/scroll';

ensureGsapRegistered();

const HERO_TICKER_UNIT = `${LANDING_COPY.ticker.map((line) => `${line} ✦`).join(' ')} `;
const HERO_TICKER_STRIP = HERO_TICKER_UNIT.repeat(6);

/** Natural line break after the first sentence. */
function splitHeroTitle(title) {
  const dotSpace = title.indexOf('. ');
  if (dotSpace === -1) return [title];
  return [title.slice(0, dotSpace + 1), title.slice(dotSpace + 2)];
}

function HeroTitleLines({ lines }) {
  return lines.map((line, lineIndex) => (
    <span key={lineIndex} className="hero-line block overflow-hidden pb-[0.04em]">
      <span className="hero-line-inner inline-block">{line}</span>
    </span>
  ));
}

function HeroTrustLine({ items }) {
  return (
    <p className="text-[12px] font-medium text-muted-foreground sm:text-[13px]">
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 ? (
            <span className="mx-2 text-muted-foreground/40" aria-hidden>
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

function HeroActions({ ctaPrimary, ctaSecondary, className = '', compact = false }) {
  return (
    <div className={className}>
      {compact ? (
        <>
          <NavAnchor
            href={CTA_HREF}
            className="inline-flex w-full"
            data-hero-reveal
            analytics={{ cta: 'try_pear', location: 'hero' }}
          >
            <Button variant="primary" size="lg" className="w-full">
              {ctaPrimary}
            </Button>
          </NavAnchor>
          <NavAnchor
            href="#features"
            className="mt-3 inline-block text-[15px] font-semibold text-[var(--seasonal-color-text)] underline-offset-4 hover:underline"
            data-hero-reveal
            analytics={{ cta: 'see_inside', location: 'hero' }}
          >
            {ctaSecondary}
          </NavAnchor>
        </>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <NavAnchor
            href={CTA_HREF}
            className="inline-flex w-full sm:w-auto"
            data-hero-reveal
            analytics={{ cta: 'try_pear', location: 'hero' }}
          >
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              {ctaPrimary}
            </Button>
          </NavAnchor>
          <NavAnchor
            href="#features"
            className="inline-flex w-full sm:w-auto"
            data-hero-reveal
            analytics={{ cta: 'see_inside', location: 'hero' }}
          >
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              {ctaSecondary}
            </Button>
          </NavAnchor>
        </div>
      )}

      <div data-hero-reveal className="mt-4">
        <HeroTrustLine items={LANDING_COPY.hero.trustLine} />
      </div>
    </div>
  );
}

export function HeroSection() {
  const heroRef = useRef(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      if (!reduce) {
        gsap.set('.hero-line-inner', { yPercent: 110, force3D: true });
        gsap.set('[data-hero-reveal]', { opacity: 0, y: 28, force3D: true });
        gsap.set('[data-hero-phone]', { opacity: 0 });
        gsap.set('[data-hero-phone-unit="front"]', { rotate: -4, force3D: true });
        gsap.set('[data-hero-phone-unit="back"]', { rotate: 4, force3D: true });

        const tl = gsap.timeline({
          onComplete() {
            gsap.set('.hero-line-inner, [data-hero-reveal]', {
              clearProps: 'transform,willChange',
            });
          },
        });

        tl.to(
          '.hero-line-inner',
          {
            yPercent: 0,
            duration: 0.85,
            ease: 'expo.out',
            stagger: 0.08,
          },
          0.45,
        );
        tl.to(
          '[data-hero-reveal]',
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
          },
          '-=0.5',
        );
        tl.to('[data-hero-phone]', { opacity: 1, duration: 0.85, ease: EASE.out }, 0.18);

        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', () => {
          const phoneScroll = gsap.timeline({
            scrollTrigger: scrollScrubConfig({
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
            }),
          });
          phoneScroll
            .to('[data-hero-phone-unit="front"]', { y: 36, x: 10, rotate: -8, ease: 'none' }, 0)
            .to('[data-hero-phone-unit="back"]', { y: 52, x: -12, rotate: 9, ease: 'none' }, 0);

          return () => phoneScroll.kill();
        });

        return () => mm.revert();
      }

      gsap.set('.hero-line-inner', { yPercent: 0 });
      gsap.set('[data-hero-reveal], [data-hero-phone]', { opacity: 1, y: 0 });
      gsap.set('[data-hero-phone-unit="front"]', { rotate: -4 });
      gsap.set('[data-hero-phone-unit="back"]', { rotate: 4 });
      return undefined;
    },
    { scope: heroRef },
  );

  const { title, subtitle, ctaPrimary, ctaSecondary } = LANDING_COPY.hero;
  const titleLines = splitHeroTitle(title);

  return (
    <section
      ref={heroRef}
      className="hero-section relative overflow-visible pb-10 pt-2 sm:pb-14 sm:pt-4 lg:pb-16 lg:pt-5"
    >
      <Container className="max-w-[1180px] overflow-visible">
        <div className="flex flex-col items-center gap-7 text-center lg:grid lg:min-h-[calc(100svh-5.75rem)] lg:grid-cols-2 lg:items-center lg:gap-14 lg:text-left">
          <div data-hero-copy className="w-full max-w-[520px] lg:justify-self-start">
            <PearWordMorph
              playEntrance
              className="mx-auto mb-3 text-[clamp(1.75rem,8vw,3.75rem)] lg:mx-0 lg:mb-0"
            />

            <h1
              aria-label={title}
              className="preserve-case mx-auto max-w-[18rem] text-[2rem] font-bold leading-[1.06] tracking-tight text-foreground sm:max-w-[560px] sm:text-[44px] sm:leading-[0.95] md:text-[50px] lg:mx-0 lg:mt-2.5 lg:text-[54px]"
            >
              <span className="sr-only">{title}</span>
              <span aria-hidden="true">
                <HeroTitleLines lines={titleLines} />
              </span>
            </h1>

            <p
              data-hero-reveal
              className="mx-auto mt-4 max-w-[20rem] text-[16px] leading-[1.55] text-muted-foreground sm:mt-5 sm:max-w-[460px] sm:text-lg sm:leading-relaxed lg:mx-0"
              style={{ fontWeight: 400 }}
            >
              {subtitle}
            </p>

            <HeroActions
              ctaPrimary={ctaPrimary}
              ctaSecondary={ctaSecondary}
              className="mt-8 hidden lg:block"
            />
          </div>

          <div
            data-hero-phone
            className="hero-phone-stage w-full min-w-0 max-w-[min(100%,320px)] lg:max-w-none lg:justify-self-end"
          >
            <HeroPhoneMock />
          </div>

          <HeroActions
            ctaPrimary={ctaPrimary}
            ctaSecondary={ctaSecondary}
            className="w-full max-w-[20rem] lg:hidden"
            compact
          />
        </div>
      </Container>

      <div
        data-hero-reveal
        aria-hidden
        className="pear-marquee mt-8 border-y border-[hsl(var(--seasonal-primary)/0.12)] bg-[hsl(var(--seasonal-primary)/0.05)] sm:mt-12"
        style={{ '--marquee-duration': '58s' }}
      >
        <div className="pear-marquee-track">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="flex shrink-0 items-center whitespace-nowrap py-2.5 text-[13px] font-semibold text-muted-foreground"
            >
              {HERO_TICKER_STRIP}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
