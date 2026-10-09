import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { CTA_HREF } from '@/components/layout/navLinks';
import { Button } from '@/components/ui/Button';
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
import { ArrowRightIcon } from '@/icons/UiIcons';

ensureGsapRegistered();

function AnimatedCheck({ index }) {
  const pathLength = 14;
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        data-beta-check
        data-beta-check-index={index}
        d="M3 8.2 L6.4 11.5 L13 4.8"
        fill="none"
        stroke="hsl(var(--seasonal-primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength}
      />
    </svg>
  );
}

function TypewriterTitle({ line1, line2, active }) {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const cursorRef = useRef(null);
  const full = `${line1}\n${line2}`;
  const reduceMotion = prefersReducedMotion();

  useGSAP(
    () => {
      const el1 = line1Ref.current;
      const el2 = line2Ref.current;
      if (!el1 || !el2) return undefined;

      if (reduceMotion || !active) {
        el1.textContent = line1;
        el2.textContent = line2;
        if (cursorRef.current) cursorRef.current.hidden = true;
        return undefined;
      }

      el1.textContent = '';
      el2.textContent = '';
      if (cursorRef.current) cursorRef.current.hidden = false;

      const counter = { v: 0 };
      const tween = gsap.to(counter, {
        v: full.length,
        duration: full.length * 0.035,
        ease: 'none',
        onUpdate: () => {
          const visible = full.slice(0, Math.floor(counter.v));
          const [first, second = ''] = visible.split('\n');
          el1.textContent = first;
          el2.textContent = second;
          if (cursorRef.current) {
            cursorRef.current.hidden = Math.floor(counter.v) >= full.length;
          }
        },
      });
      return () => tween.kill();
    },
    { dependencies: [active, line1, line2, full], revertOnUpdate: true },
  );

  return (
    <>
      <span ref={line1Ref}>{line1}</span>
      <br />
      <span ref={line2Ref}>{line2}</span>
      {!reduceMotion ? (
        <span
          ref={cursorRef}
          className="inline-block w-[2px] animate-pulse bg-[var(--seasonal-color-main)]"
          aria-hidden
          hidden
        >
          &nbsp;
        </span>
      ) : null}
    </>
  );
}

export function BetaAccessSection() {
  const sectionRef = useRef(null);
  const [typingActive, setTypingActive] = useState(false);
  const {
    eyebrow,
    titleLine1,
    titleLine2,
    sub,
    tierLabel,
    badge,
    price,
    priceSuffix,
    features,
    buttonLabel,
    buttonNote,
    footnote,
  } = LANDING_COPY.betaSection;

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      if (reduce) {
        gsap.set(
          '[data-beta-eyebrow], [data-beta-sub], [data-beta-card], [data-beta-card] *, [data-beta-footnote]',
          { opacity: 1, y: 0, scale: 1 },
        );
        gsap.set('[data-beta-check]', { strokeDashoffset: 0 });
        setTypingActive(true);
        return;
      }

      gsap.set('[data-beta-eyebrow]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-beta-sub]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-beta-footnote]', { opacity: 0, y: PEAR_OFFSET_Y_SM });

      gsap.to('[data-beta-eyebrow]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        scrollTrigger: scrollRevealConfig({
          trigger: sectionRef.current,
          onEnter: () => setTypingActive(true),
        }),
      });

      gsap.to('[data-beta-sub]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        delay: 0.5,
        scrollTrigger: scrollRevealConfig({ trigger: sectionRef.current }),
      });

      gsap.to('[data-beta-footnote]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        scrollTrigger: scrollRevealConfig({ trigger: '[data-beta-footnote]' }),
      });

      gsap.set('[data-beta-card]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.set('[data-beta-price], [data-beta-tier], [data-beta-feature], [data-beta-cta]', {
        opacity: 0,
        y: PEAR_OFFSET_Y_SM,
      });

      const cardTl = gsap.timeline({
        scrollTrigger: scrollRevealConfig({ trigger: '[data-beta-card]' }),
      });

      cardTl.to('[data-beta-card]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
      });
      cardTl.to(
        '[data-beta-tier]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.32',
      );
      cardTl.to(
        '[data-beta-price]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.28',
      );
      cardTl.to(
        '[data-beta-feature]',
        {
          opacity: 1,
          y: 0,
          duration: PEAR_DURATION_ENTRANCE,
          ease: EASE.out,
          stagger: PEAR_STAGGER,
        },
        '-=0.24',
      );

      const checks = gsap.utils.toArray('[data-beta-check]');
      checks.forEach((check, index) => {
        gsap.to(check, {
          strokeDashoffset: 0,
          duration: PEAR_DURATION_ENTRANCE,
          ease: EASE.out,
          delay: index * PEAR_STAGGER,
          scrollTrigger: scrollRevealConfig({ trigger: '[data-beta-card]' }),
        });
      });

      cardTl.to(
        '[data-beta-cta]',
        { opacity: 1, y: 0, duration: PEAR_DURATION_ENTRANCE, ease: EASE.out },
        '-=0.12',
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="beta" className="py-24 sm:py-32">
      <Container className="max-w-[1180px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p data-beta-eyebrow className="section-eyebrow">
              {eyebrow}
            </p>
            <h2 className="max-w-[540px] text-[36px] font-bold leading-[1.1] text-foreground sm:text-[48px]">
              <TypewriterTitle line1={titleLine1} line2={titleLine2} active={typingActive} />
            </h2>
            <p
              data-beta-sub
              className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-muted-foreground"
              style={{ fontWeight: 400 }}
            >
              {sub}
            </p>
          </div>

          <div data-beta-card className="w-full max-w-[440px] lg:justify-self-end">
            <GlassCard padding="p-8 sm:p-10" className="seasonal-down-glow rounded-2xl">
              <div data-beta-tier className="flex flex-wrap items-center justify-between gap-3">
                <p className="preserve-case text-[13px] font-semibold tracking-[0.18em] text-[var(--seasonal-color-text)]">
                  {tierLabel}
                </p>
                <span className="rounded-full bg-[hsl(var(--seasonal-primary)/0.12)] px-3 py-1 text-[11px] font-semibold text-[var(--seasonal-color-text)]">
                  {badge}
                </span>
              </div>

              <p data-beta-price className="mt-4 leading-tight">
                <span className="text-[48px] font-bold text-foreground sm:text-[56px]">
                  {price}
                </span>
                <span className="text-xl text-muted-foreground" style={{ fontWeight: 400 }}>
                  {' '}
                  {priceSuffix}
                </span>
              </p>

              <ul className="mt-8 grid grid-cols-1 gap-3">
                {features.map((feature, index) => (
                  <li key={feature} data-beta-feature className="flex items-center gap-3">
                    <AnimatedCheck index={index} />
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div data-beta-cta className="mt-8">
                <NavAnchor
                  href={CTA_HREF}
                  className="inline-flex w-full"
                  analytics={{ cta: 'try_pear', location: 'beta' }}
                >
                  <Button variant="primary" size="lg" className="w-full">
                    {buttonLabel}
                    <ArrowRightIcon size={18} />
                  </Button>
                </NavAnchor>
                <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                  {buttonNote}
                </p>
              </div>
            </GlassCard>
          </div>
        </div>

        <p
          data-beta-footnote
          className="mx-auto mt-8 max-w-[460px] text-center text-[13px] font-medium text-muted-foreground lg:text-left"
        >
          {footnote}
        </p>
      </Container>
    </section>
  );
}
