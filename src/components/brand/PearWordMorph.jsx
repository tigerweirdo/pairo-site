import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsapRegistered, gsap, prefersReducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/utils';

ensureGsapRegistered();

const MORPH_DURATION = 0.7;

const letterClass = 'absolute leading-none will-change-[transform,opacity]';

function measureWord(root, word) {
  const probe = document.createElement('span');
  probe.textContent = word;
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap;left:0;top:0;';
  root.appendChild(probe);

  const base = root.getBoundingClientRect().left;
  const width = probe.getBoundingClientRect().width;
  const textNode = probe.firstChild;
  const range = document.createRange();
  const centers = [];

  for (let i = 0; i < word.length; i += 1) {
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    const rect = range.getBoundingClientRect();
    centers.push(rect.left + rect.width / 2 - base);
  }

  root.removeChild(probe);
  return { width, centers };
}

/**
 * pair ↔ pear letter morph — resting state is "pear".
 * Slot positions measured from the live font on mount.
 */
export function PearWordMorph({
  className,
  intervalMs = 20000,
  pairHoldMs = 1200,
  playEntrance = false,
  loop = true,
  onEntranceComplete,
}) {
  const rootRef = useRef(null);
  const pRef = useRef(null);
  const eRef = useRef(null);
  const aRef = useRef(null);
  const iRef = useRef(null);
  const rRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const letterP = pRef.current;
      const letterE = eRef.current;
      const letterA = aRef.current;
      const letterI = iRef.current;
      const letterR = rRef.current;
      if (!root || !letterP || !letterE || !letterA || !letterI || !letterR) return undefined;

      const allLetters = [letterP, letterE, letterA, letterI, letterR];
      const reduce = prefersReducedMotion();

      // Hide until the first measure runs, so the absolutely-positioned letters
      // never flash stacked at left:0 while we wait for the font to load.
      gsap.set(root, { autoAlpha: 0 });
      gsap.set(allLetters, {
        position: 'absolute',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
      });

      let loopTl = null;
      let firstRun = true;

      const build = () => {
        loopTl?.kill();
        loopTl = null;
        gsap.killTweensOf(allLetters);

        const pear = measureWord(root, 'pear');
        const pair = measureWord(root, 'pair');
        // 'a' slides from pear slot 2 → pair slot 1; reuse the same glyph.
        const pairShiftX = pair.centers[1] - pear.centers[2];

        root.style.width = `${pear.width}px`;

        const fontSize = parseFloat(getComputedStyle(root).fontSize) || 16;
        const letterOutY = fontSize * 0.42;

        // p (slot 0) and the shared 'a' base never change between words.
        gsap.set(letterP, { left: pear.centers[0], x: 0, y: 0, opacity: 1 });
        gsap.set(letterA, { left: pear.centers[2], y: 0, opacity: 1 });

        const setPearState = () => {
          gsap.set(letterA, { x: 0 });
          gsap.set(letterR, { left: pear.centers[3], x: 0, y: 0, opacity: 1 });
          gsap.set(letterE, { left: pear.centers[1], opacity: 1, y: 0 });
          gsap.set(letterI, { left: pair.centers[2], opacity: 0, y: letterOutY });
        };

        const setPairState = () => {
          gsap.set(letterA, { x: pairShiftX });
          gsap.set(letterR, { left: pair.centers[3], x: 0, y: 0, opacity: 1 });
          gsap.set(letterE, { left: pear.centers[1], opacity: 0, y: -letterOutY });
          gsap.set(letterI, { left: pair.centers[2], opacity: 1, y: 0 });
        };

        const morphToPear = () =>
          gsap
            .timeline({ defaults: { duration: MORPH_DURATION } })
            .to(letterA, { x: 0, ease: 'power2.inOut' }, 0)
            .to(letterR, { left: pear.centers[3], ease: 'power2.inOut' }, 0)
            .to(letterI, { opacity: 0, y: letterOutY, ease: 'power1.in' }, 0)
            .to(letterE, { opacity: 1, y: 0, ease: 'power2.out' }, 0.12);

        const morphToPair = () =>
          gsap
            .timeline({ defaults: { duration: MORPH_DURATION } })
            .to(letterA, { x: pairShiftX, ease: 'power2.inOut' }, 0)
            .to(letterR, { left: pair.centers[3], ease: 'power2.inOut' }, 0)
            .to(letterI, { opacity: 1, y: 0, ease: 'power2.out' }, 0)
            .to(letterE, { opacity: 0, y: -letterOutY, ease: 'power1.in' }, 0.12);

        const startLoop = () => {
          if (!loop) return;

          const pearHoldMs = Math.max(0, intervalMs - MORPH_DURATION * 2000 - pairHoldMs);

          loopTl = gsap.timeline({ repeat: -1, repeatDelay: pearHoldMs / 1000 });
          loopTl
            .add(morphToPair())
            .to({}, { duration: pairHoldMs / 1000 })
            .add(morphToPear());
        };

        if (reduce) {
          setPearState();
          gsap.set(root, { autoAlpha: 1 });
          if (firstRun) onEntranceComplete?.();
          firstRun = false;
          return;
        }

        if (firstRun && playEntrance) {
          setPairState();
          gsap.set(root, { autoAlpha: 1 });
          const entrance = morphToPear();
          entrance.eventCallback('onComplete', () => {
            onEntranceComplete?.();
            startLoop();
          });
        } else {
          setPearState();
          gsap.set(root, { autoAlpha: 1 });
          if (firstRun) onEntranceComplete?.();
          startLoop();
        }

        firstRun = false;
      };

      // Measure only once the real font is ready — fallback metrics would place
      // the letters at the wrong x and make them overlap.
      let cancelled = false;
      const fontsReady = root.ownerDocument?.fonts?.ready ?? Promise.resolve();
      Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 2000))]).then(() => {
        if (!cancelled) build();
      });

      // Re-measure on layout change (responsive font-size, orientation). Observe
      // the parent — root's own width is set by us, so observing it would loop.
      const resizeTarget = root.parentElement;
      let resizeTimer = null;
      let lastWidth = resizeTarget ? Math.round(resizeTarget.getBoundingClientRect().width) : 0;
      const ResizeObserverCtor = typeof window !== 'undefined' ? window.ResizeObserver : undefined;
      const ro =
        ResizeObserverCtor && resizeTarget
          ? new ResizeObserverCtor(() => {
              const width = Math.round(resizeTarget.getBoundingClientRect().width);
              if (cancelled || firstRun || width === lastWidth) return;
              lastWidth = width;
              if (resizeTimer) clearTimeout(resizeTimer);
              resizeTimer = setTimeout(() => {
                if (!cancelled) build();
              }, 150);
            })
          : null;
      ro?.observe(resizeTarget);

      return () => {
        cancelled = true;
        if (resizeTimer) clearTimeout(resizeTimer);
        ro?.disconnect();
        loopTl?.kill();
        gsap.killTweensOf(allLetters);
      };
    },
    {
      scope: rootRef,
      dependencies: [intervalMs, pairHoldMs, playEntrance, loop, onEntranceComplete],
    },
  );

  return (
    <div
      ref={rootRef}
      data-pear-word-morph
      className={cn(
        'pear-word-morph preserve-case relative inline-block h-[1em] font-bold leading-none text-[var(--seasonal-color-main)]',
        className,
      )}
      aria-label="pear"
    >
      <span ref={pRef} className={letterClass} aria-hidden>
        p
      </span>
      <span ref={eRef} className={letterClass} aria-hidden>
        e
      </span>
      <span ref={aRef} className={letterClass} aria-hidden>
        a
      </span>
      <span ref={iRef} className={letterClass} aria-hidden>
        i
      </span>
      <span ref={rRef} className={letterClass} aria-hidden>
        r
      </span>
    </div>
  );
}
