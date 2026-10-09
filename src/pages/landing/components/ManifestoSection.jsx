import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import PearIcon from '@/icons/PearIcons';
import { Container } from '@/components/layout/Container';
import { LANDING_COPY } from '@/pages/landing/landing.content';
import { PEAR_DURATION_ENTRANCE, PEAR_OFFSET_Y, PEAR_STAGGER } from '@/constants/motion';
import { ensureGsapRegistered, gsap, ScrollTrigger, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig, scrollScrubConfig, scrollTriggerConfig } from '@/lib/scroll';
import { cn } from '@/lib/utils';

ensureGsapRegistered();

const KEY_WORDS = new Set(['warm', 'two', 'remembered']);

function isKeyWord(text) {
  return KEY_WORDS.has(text.toLowerCase().replace(/[.,'"]/g, ''));
}

/** Word-level tokens — whitespace preserved for natural line breaks. */
function ManifestoWordStream({ text }) {
  const tokens = text.split(/(\s+)/);

  return tokens.map((token, index) => {
    if (!token.trim()) return token;

    const highlighted = isKeyWord(token);

    if (highlighted) {
      return (
        <span
          key={index}
          data-manifesto-word
          data-manifesto-hl
          className="group/hl relative z-[1] inline-block whitespace-pre px-[0.16em] font-semibold"
        >
          <span
            data-manifesto-hl-bg
            aria-hidden
            className="pointer-events-none absolute -inset-x-[2%] inset-y-[6%] -z-10 origin-left -rotate-[1.5deg] scale-x-0 rounded-[0.4em] bg-[hsl(var(--seasonal-primary))] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-[.manifesto-hl-on]/hl:scale-x-100"
          />
          <span
            data-manifesto-hl-text
            className="relative z-[1] transition-colors duration-300 group-[.manifesto-hl-on]/hl:text-[hsl(var(--background))]"
          >
            {token}
          </span>
        </span>
      );
    }

    return (
      <span key={index} data-manifesto-word className="inline-block whitespace-pre font-medium">
        {token}
      </span>
    );
  });
}

export function ManifestoSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const { eyebrow, paragraph, anchors } = LANDING_COPY.manifesto;
  const [leadParagraph, followParagraph] = paragraph.split('\n\n');

  useGSAP(
    () => {
      if (!sectionRef.current || !textRef.current) return;

      const reduce = prefersReducedMotion();
      if (reduce) {
        gsap.set('[data-manifesto-eyebrow], [data-manifesto-word], [data-anchor-pill]', {
          opacity: 1,
          y: 0,
        });
        sectionRef.current.querySelectorAll('[data-manifesto-hl]').forEach((el) => {
          el.classList.add('manifesto-hl-on');
        });
        return;
      }

      gsap.set('[data-manifesto-eyebrow]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.from('[data-manifesto-eyebrow]', {
        opacity: 0,
        y: PEAR_OFFSET_Y,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        scrollTrigger: scrollRevealConfig({ trigger: sectionRef.current }),
      });

      gsap.set('[data-manifesto-block]', { opacity: 0.18 });
      gsap.to('[data-manifesto-block]', {
        opacity: 1,
        stagger: 0.12,
        ease: 'none',
        scrollTrigger: scrollScrubConfig({
          trigger: textRef.current,
          start: 'top 86%',
          end: 'bottom 48%',
        }),
      });

      ScrollTrigger.create(
        scrollTriggerConfig({
          trigger: textRef.current,
          start: 'bottom 52%',
          toggleClass: { targets: '[data-manifesto-hl]', className: 'manifesto-hl-on' },
        }),
      );

      gsap.set('[data-anchor-pill]', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.to('[data-anchor-pill]', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        stagger: PEAR_STAGGER,
        scrollTrigger: scrollRevealConfig({ trigger: '[data-anchor-list]' }),
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[hsl(var(--seasonal-card-wash))] to-transparent opacity-50"
      />

      <Container className="max-w-[820px]">
        <div className="flex min-h-0 flex-col justify-center sm:min-h-[54vh]">
          <p data-manifesto-eyebrow className="section-eyebrow text-center">
            {eyebrow}
          </p>

          <h2
            ref={textRef}
            className={cn(
              'mx-auto max-w-[760px] text-left text-[28px] leading-[1.14] tracking-[-0.02em] text-foreground',
              'sm:text-[34px] md:text-[40px]',
            )}
          >
            <span data-manifesto-block className="block">
              <ManifestoWordStream text={leadParagraph} />
            </span>
            <span data-manifesto-block className="mt-6 block sm:mt-7">
              <ManifestoWordStream text={followParagraph} />
            </span>
          </h2>
        </div>

        <ul
          data-anchor-list
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-16 sm:flex-row sm:gap-6"
        >
          {anchors.map(({ icon, label }) => (
            <li
              key={label}
              data-anchor-pill
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--seasonal-primary)/0.10)] bg-[hsl(var(--seasonal-primary)/0.06)] px-4 py-2"
            >
              <PearIcon name={icon} size={16} className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-[13px] font-semibold text-foreground">{label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
