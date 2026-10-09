import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Accordion } from '@/components/ui/Accordion';
import { Container } from '@/components/layout/Container';
import { FAQ_ITEMS, LANDING_COPY } from '@/pages/landing/landing.content';
import {
  PEAR_DURATION_ENTRANCE,
  PEAR_OFFSET_Y,
  PEAR_STAGGER,
  PEAR_STAGGER_TIGHT,
} from '@/constants/motion';
import { ensureGsapRegistered, gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import { scrollRevealConfig } from '@/lib/scroll';

ensureGsapRegistered();

export function FAQSection() {
  const sectionRef = useRef(null);
  const { eyebrow, title, sub } = LANDING_COPY.faqSection;
  const firstGroup = FAQ_ITEMS.slice(0, 4);
  const secondGroup = FAQ_ITEMS.slice(4);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      if (reduce) {
        gsap.set('[data-faq-header] > *, [data-faq-group] > *', { opacity: 1, y: 0 });
        return;
      }

      gsap.set('[data-faq-header] > *', { opacity: 0, y: PEAR_OFFSET_Y });
      gsap.to('[data-faq-header] > *', {
        opacity: 1,
        y: 0,
        duration: PEAR_DURATION_ENTRANCE,
        ease: EASE.out,
        stagger: PEAR_STAGGER,
        scrollTrigger: scrollRevealConfig({ trigger: '[data-faq-header]' }),
      });

      // Accordion her grubu kendi <div> wrapper'ında render eder; aslı item'lar onun
      // ilk seviyedeki çocuklarıdır. Bu yüzden bir alt seviyeye iniyoruz.
      gsap.utils.toArray('[data-faq-group]').forEach((group) => {
        const items = group.querySelectorAll(':scope > div > div');
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: PEAR_OFFSET_Y });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: PEAR_DURATION_ENTRANCE,
          ease: EASE.out,
          stagger: PEAR_STAGGER_TIGHT,
          scrollTrigger: scrollRevealConfig({ trigger: group }),
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="faq" className="py-24 sm:py-28">
      <Container className="max-w-[820px]">
        <header data-faq-header className="mb-12 text-center">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="mx-auto max-w-[480px] overflow-hidden text-[36px] font-bold leading-tight text-foreground sm:text-[44px]">
            <span className="block">{title}</span>
          </h2>
          <p
            className="mx-auto mt-3 max-w-[480px] text-[17px] leading-relaxed text-muted-foreground"
            style={{ fontWeight: 400 }}
          >
            {sub}
          </p>
        </header>

        <div>
          <div data-faq-group>
            <Accordion items={firstGroup} allowMultiple={false} />
          </div>
          <div data-faq-group>
            <Accordion items={secondGroup} allowMultiple={false} />
          </div>
        </div>
      </Container>
    </section>
  );
}
