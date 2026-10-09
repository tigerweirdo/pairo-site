import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { ensureGsapRegistered, gsap, prefersReducedMotion } from '@/lib/gsap';
import { scrollScrubConfig } from '@/lib/scroll';

ensureGsapRegistered();

const RIBBON_PATH = 'M-120,120 Q300,30 720,110 T 1760,100';

/**
 * Section divider — lowercase mantra gliding along a curved path as you scroll.
 * Adapted from the scrollytelling prototype's ribbon; reads seasonal tokens.
 */
export function RibbonDivider() {
  const sectionRef = useRef(null);
  const textPathRef = useRef(null);

  useGSAP(
    () => {
      const textPath = textPathRef.current;
      const pathEl = sectionRef.current?.querySelector('path');
      if (!textPath || !pathEl) return;

      const pathLength = pathEl.getTotalLength();

      if (prefersReducedMotion()) {
        textPath.setAttribute('startOffset', `${-pathLength * 0.12}`);
        return;
      }

      gsap.fromTo(
        textPath,
        { attr: { startOffset: pathLength * 0.05 } },
        {
          attr: { startOffset: -pathLength * 0.45 },
          ease: 'none',
          scrollTrigger: scrollScrubConfig({ trigger: sectionRef.current }),
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} aria-hidden className="overflow-hidden py-10 sm:py-16">
      <svg
        viewBox="0 0 1640 190"
        className="-ml-[20%] w-[140%] overflow-visible max-sm:-ml-[65%] max-sm:w-[230%]"
      >
        <path id="pear-ribbon-path" d={RIBBON_PATH} fill="none" />
        <text
          className="select-none"
          style={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 700,
            fontSize: '58px',
            letterSpacing: '0.02em',
            fill: 'hsl(var(--seasonal-primary) / 0.55)',
          }}
        >
          <textPath ref={textPathRef} href="#pear-ribbon-path" startOffset="0">
            {LANDING_COPY.ribbon}
          </textPath>
        </text>
      </svg>
    </section>
  );
}
