import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useGSAP } from '@gsap/react';
import { Container } from '@/components/layout/Container';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { PearPrimaryAction } from '@/components/ui/PearPrimaryAction';
import { BrandMarkIcon } from '@/components/brand/BrandMarkIcon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PearBrandMark } from '@/icons/PearBrandMark';
import { CheckIcon, LockIcon, SparklesIcon } from '@/icons/PearIcons';
import { ArrowRightIcon } from '@/icons/UiIcons';
import { ensureGsapRegistered, gsap } from '@/lib/gsap';
import { applySeasonalColors, resolveHemisphereSync } from '@/lib/seasonColors';
import { syncBrandTheme } from '@/lib/theme/syncBrandTheme';
import { SCRUBBER_MODIFIER_OPTS } from '@/lib/theme/scrubberPreview';
import { FAQ_ITEMS, STORY_COPY } from '@/pages/landing/landing.content';
import { APP_URL } from '@/components/layout/navLinks';
import './time-story.css';

const PearWorldCanvas = lazy(() => import('./PearWorldCanvas'));

const STORY_FAQ = FAQ_ITEMS.filter(({ id }) => ['free', 'private', 'app-store'].includes(id));

ensureGsapRegistered();

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <WorldFallback />;
    return this.props.children;
  }
}

function WorldFallback() {
  return (
    <div className="spectral-fallback" aria-hidden>
      <PearBrandMark className="spectral-fallback__mark" frameScale={1} />
      <i />
    </div>
  );
}

function StoryEyebrow({ children }) {
  return <p className="cinema-eyebrow">{children}</p>;
}

function SparkProof({ onRevealChange }) {
  const [answer, setAnswer] = useState('');
  const revealed = Boolean(answer);

  const chooseAnswer = (choice) => {
    setAnswer(choice);
    onRevealChange(true);
  };

  const resetAnswer = () => {
    setAnswer('');
    onRevealChange(false);
  };

  return (
    <aside className="product-proof product-proof--spark" data-product-proof="spark">
      <header className="product-proof__header">
        <span>
          <SparklesIcon size={18} aria-hidden />
        </span>
        <div>
          <p>SPARK / DAY 047</p>
          <strong>both answer before either sees.</strong>
        </div>
        <i>09:41</i>
      </header>

      <p className="product-proof__question">{STORY_COPY.spark.question}</p>

      <div className="spark-proof__choices" inert={revealed ? true : undefined}>
        {STORY_COPY.spark.choices.slice(0, 3).map((choice) => (
          <button
            key={choice}
            type="button"
            aria-pressed={answer === choice}
            onClick={() => chooseAnswer(choice)}
          >
            <span>{choice}</span>
            {answer === choice ? <CheckIcon size={16} aria-hidden /> : null}
          </button>
        ))}
      </div>

      <div className="spark-proof__partner" data-revealed={revealed}>
        <LockIcon size={18} aria-hidden />
        <div>
          <p>JESSE&apos;S SIDE</p>
          <strong>
            {revealed ? STORY_COPY.spark.partnerAnswer : 'opens when your side is in.'}
          </strong>
        </div>
        {revealed ? (
          <button type="button" onClick={resetAnswer}>
            reset
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function YearProof() {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const totalDays = Math.round(
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / (24 * 60 * 60 * 1000),
  );
  const today = Math.floor(
    (Date.UTC(year, now.getMonth(), now.getDate()) - Date.UTC(year, 0, 1)) / (24 * 60 * 60 * 1000),
  );
  const [day, setDay] = useState(today);
  const hemisphere = useMemo(() => resolveHemisphereSync(), []);
  const previewDate = useMemo(() => new Date(year, 0, day + 1), [day, year]);
  const dateLabel = previewDate.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });

  useEffect(
    () => () => {
      syncBrandTheme(new Date(), { instant: true });
    },
    [],
  );

  const previewSeason = (event) => {
    const nextDay = Number(event.target.value);
    const nextDate = new Date(year, 0, nextDay + 1);
    setDay(nextDay);
    applySeasonalColors(nextDate, hemisphere, {
      ...SCRUBBER_MODIFIER_OPTS,
      instant: true,
    });
  };

  return (
    <aside className="product-proof product-proof--year" data-product-proof="year">
      <header className="product-proof__header">
        <span aria-hidden>365</span>
        <div>
          <p>THE INTERFACE IS A CLOCK</p>
          <strong>drag through the year.</strong>
        </div>
        <i>{dateLabel}</i>
      </header>

      <div className="year-spectrum">
        <input
          type="range"
          min="0"
          max={totalDays - 1}
          value={day}
          onChange={previewSeason}
          aria-label="Preview pairo's seasonal palette through the year"
          aria-valuetext={dateLabel}
        />
        <div className="year-spectrum__labels" aria-hidden>
          <span>JAN</span>
          <span>APR</span>
          <span>JUL</span>
          <span>OCT</span>
          <span>DEC</span>
        </div>
      </div>

      <div className="year-proof__special">
        <i aria-hidden />
        <span>
          <strong>JUL 16 / JESSE&apos;S BIRTHDAY</strong>
          <b>one date interrupts the entire color system.</b>
        </span>
      </div>
    </aside>
  );
}

function ChapterTitle({ lines, as: Tag = 'h2', id, wrapFirstInSpan = false }) {
  return (
    <Tag id={id}>
      {wrapFirstInSpan ? <span>{lines[0]}</span> : lines[0]}
      {lines[1] ? <span>{lines[1]}</span> : null}
    </Tag>
  );
}

function CinematicChapters() {
  const { hero, pair, warm, cold, return: ret } = STORY_COPY.chapters;

  return (
    <div className="cinematic-chapters">
      <article className="cinematic-chapter cinematic-chapter--hero" data-story-chapter="hero">
        <div className="cinematic-chapter__copy">
          <StoryEyebrow>{hero.eyebrow}</StoryEyebrow>
          <ChapterTitle as="h1" wrapFirstInSpan lines={hero.titleLines} />
          <p>{hero.body}</p>
          <div className="cinematic-chapter__actions">
            <PearPrimaryAction
              location="cinematic-hero"
              variant="secondary"
              shareLabel={hero.shareLabel}
            />
            <NavAnchor href="#story-pair" className="cinema-text-link">
              {hero.followLabel}
              <ArrowRightIcon size={18} />
            </NavAnchor>
          </div>
        </div>

        <div className="cinema-scroll-prompt" aria-hidden>
          <span>SCROLL TO BRING BOTH SIDES TOGETHER</span>
          <i />
        </div>
      </article>

      <article className="cinematic-chapter cinematic-chapter--pair" data-story-chapter="pair">
        <div className="cinematic-chapter__copy">
          <StoryEyebrow>{pair.eyebrow}</StoryEyebrow>
          <ChapterTitle lines={pair.titleLines} />
          <p>{pair.body}</p>
        </div>
        <strong className="cinematic-chapter__number" aria-hidden>
          01
        </strong>
      </article>

      <article className="cinematic-chapter cinematic-chapter--warm" data-story-chapter="warm">
        <div className="cinematic-chapter__copy">
          <StoryEyebrow>{warm.eyebrow}</StoryEyebrow>
          <ChapterTitle lines={warm.titleLines} />
          <p>{warm.body}</p>
        </div>
        <strong className="cinematic-chapter__number" aria-hidden>
          02
        </strong>
      </article>

      <article className="cinematic-chapter cinematic-chapter--cold" data-story-chapter="cold">
        <div className="cinematic-chapter__copy">
          <StoryEyebrow>{cold.eyebrow}</StoryEyebrow>
          <ChapterTitle lines={cold.titleLines} />
          <p>{cold.body}</p>
        </div>
        <strong className="cinematic-chapter__number" aria-hidden>
          03
        </strong>
      </article>

      <article className="cinematic-chapter cinematic-chapter--return" data-story-chapter="return">
        <div className="cinematic-chapter__copy">
          <StoryEyebrow>{ret.eyebrow}</StoryEyebrow>
          <ChapterTitle lines={ret.titleLines} />
          <p>{ret.body}</p>
        </div>
        <strong className="cinematic-chapter__number" aria-hidden>
          04
        </strong>
      </article>
    </div>
  );
}

function StoryInterface({ onRevealChange }) {
  return (
    <>
      <div className="cinema-system-label cinema-system-label--left" aria-hidden>
        <span>PEAR / LIVE SIGNAL</span>
        <i>PRIVATE CHANNEL / 02</i>
      </div>
      <div className="cinema-system-label cinema-system-label--right" aria-hidden>
        <span>SCENE 00—04</span>
        <i>OKLCH / LIVE CALENDAR</i>
      </div>

      <div className="cinematic-product-layer">
        <SparkProof onRevealChange={onRevealChange} />
        <YearProof />
      </div>

      <div className="cinema-progress" aria-hidden>
        <span>TODAY</span>
        <i>
          <b data-story-progress />
        </i>
        <span>ONE YEAR</span>
      </div>
    </>
  );
}

function FinalScene() {
  return (
    <section className="cinema-final" id="beta" aria-labelledby="final-title">
      <Container className="cinema-final__container">
        <div className="cinema-final__lead">
          <span className="cinema-final__mark">
            <BrandMarkIcon size={42} aria-hidden />
          </span>
          <StoryEyebrow>{STORY_COPY.final.eyebrow}</StoryEyebrow>
          <ChapterTitle as="h2" id="final-title" lines={STORY_COPY.final.titleLines} />
          <p>{STORY_COPY.final.sub}</p>
          <PearPrimaryAction
            location="cinematic-final"
            size="lg"
            appLabel={STORY_COPY.final.cta}
            shareLabel={STORY_COPY.final.shareCta}
          />
          <small>{APP_URL ? STORY_COPY.final.note : STORY_COPY.final.shareNote}</small>
        </div>

        <div className="cinema-final__details">
          <article className="cinema-privacy" id="privacy">
            <LockIcon size={24} aria-hidden />
            <div>
              <h3>{STORY_COPY.final.privacyTitle}</h3>
              <p>{STORY_COPY.final.privacyBody}</p>
            </div>
          </article>

          <div className="cinema-faq" id="faq">
            <p>{STORY_COPY.final.faqEyebrow}</p>
            {STORY_FAQ.map((item) => (
              <details key={item.id}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function TimeStoryExperience() {
  const rootRef = useRef(null);
  const storyRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const revealRef = useRef(false);
  const [worldActive, setWorldActive] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery('(max-width: 899px)');

  const resetPointer = useCallback(() => {
    pointerRef.current.x = 0;
    pointerRef.current.y = 0;
  }, []);
  const setSparkRevealed = useCallback((revealed) => {
    revealRef.current = revealed;
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const hero = rootRef.current?.querySelector('[data-story-chapter="hero"]');
        const pair = rootRef.current?.querySelector('[data-story-chapter="pair"]');
        const warm = rootRef.current?.querySelector('[data-story-chapter="warm"]');
        const cold = rootRef.current?.querySelector('[data-story-chapter="cold"]');
        const returnChapter = rootRef.current?.querySelector('[data-story-chapter="return"]');
        const sparkProof = rootRef.current?.querySelector('[data-product-proof="spark"]');
        const yearProof = rootRef.current?.querySelector('[data-product-proof="year"]');
        const progressBar = rootRef.current?.querySelector('[data-story-progress]');

        gsap.set(hero, { autoAlpha: 1 });
        gsap.set([pair, warm, cold, returnChapter], { autoAlpha: 0, y: 44 });
        gsap.set(sparkProof, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(yearProof, {
          autoAlpha: 0,
          y: 34,
          scale: 0.96,
        });
        gsap.set(progressBar, { scaleX: 0 });

        const intro = gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-story-chapter="hero"] .cinema-eyebrow', {
            y: 18,
            autoAlpha: 0,
            duration: 0.55,
          })
          .from(
            '[data-story-chapter="hero"] h1 > *',
            { yPercent: 24, rotation: 2, duration: 0.82, stagger: 0.08 },
            0.05,
          )
          .from(
            '[data-story-chapter="hero"] .cinematic-chapter__copy > p:last-of-type',
            { y: 18, autoAlpha: 0, duration: 0.58 },
            0.28,
          )
          .from(
            '[data-story-chapter="hero"] .cinematic-chapter__actions',
            { y: 16, autoAlpha: 0, duration: 0.52 },
            0.38,
          );

        const storyTimeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: compact ? 0.45 : 0.8,
            invalidateOnRefresh: true,
            onEnter: () => setWorldActive(true),
            onEnterBack: () => setWorldActive(true),
            onLeave: () => setWorldActive(false),
            onUpdate: (self) => {
              progressRef.current = self.progress;
            },
          },
        });

        storyTimeline
          .addLabel('hero', 0)
          .to(progressBar, { scaleX: 1, duration: 1 }, 0)
          .to(hero, { autoAlpha: 0, y: -54, duration: 0.075 }, 0.12)
          .to(sparkProof, { autoAlpha: 0, y: -28, scale: 0.96, duration: 0.065 }, 0.13)
          .fromTo(pair, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.075 }, 0.19)
          .addLabel('pair', 0.22)
          .to(pair, { autoAlpha: 0, y: -46, duration: 0.065 }, 0.32)
          .fromTo(warm, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.075 }, 0.36)
          .addLabel('warm', 0.4)
          .to(warm, { autoAlpha: 0, y: -46, duration: 0.065 }, 0.49)
          .fromTo(cold, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.075 }, 0.53)
          .addLabel('cold', 0.57)
          .to(cold, { autoAlpha: 0, y: -46, duration: 0.065 }, 0.67)
          .fromTo(
            returnChapter,
            { autoAlpha: 0, y: 44 },
            { autoAlpha: 1, y: 0, duration: 0.08 },
            0.72,
          )
          .fromTo(
            yearProof,
            { autoAlpha: 0, y: 34, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.11 },
            0.76,
          )
          .addLabel('return', 0.8)
          .to(returnChapter, { y: -18, duration: 0.2 }, 0.82)
          .to(yearProof, { y: -10, duration: 0.2 }, 0.82);

        const pointerX = gsap.quickTo(pointerRef.current, 'x', {
          duration: 0.55,
          ease: 'power3.out',
        });
        const pointerY = gsap.quickTo(pointerRef.current, 'y', {
          duration: 0.55,
          ease: 'power3.out',
        });

        const movePointer = (event) => {
          const bounds = storyRef.current?.getBoundingClientRect();
          if (!bounds) return;
          pointerX(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
          pointerY((event.clientY / window.innerHeight) * 2 - 1);
        };

        storyRef.current?.addEventListener('pointermove', movePointer);
        storyRef.current?.addEventListener('pointerleave', resetPointer);

        return () => {
          storyRef.current?.removeEventListener('pointermove', movePointer);
          storyRef.current?.removeEventListener('pointerleave', resetPointer);
          intro.kill();
          storyTimeline.kill();
          revealRef.current = false;
          resetPointer();
        };
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        progressRef.current = 0.08;
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [compact, resetPointer], revertOnUpdate: true },
  );

  return (
    <div className="cinema-story" ref={rootRef} data-prerender-ready>
      <section
        className="cinema-scroll"
        id="story-start"
        ref={storyRef}
        aria-label="How pairo turns two private signals into one living seasonal color"
      >
        <span className="cinema-anchor cinema-anchor--day" id="story-pair" aria-hidden />
        <span className="cinema-anchor cinema-anchor--year" id="seasonal" aria-hidden />

        <div className="cinema-sticky">
          <SceneBoundary>
            <Suspense fallback={<WorldFallback />}>
              <PearWorldCanvas
                progressRef={progressRef}
                pointerRef={pointerRef}
                revealRef={revealRef}
                reducedMotion={reducedMotion}
                compact={compact}
                active={worldActive}
              />
            </Suspense>
          </SceneBoundary>

          <div className="cinema-vignette" aria-hidden />
          <div className="cinema-grain" aria-hidden />
          <CinematicChapters />
          <StoryInterface onRevealChange={setSparkRevealed} />
        </div>
      </section>

      <FinalScene />
    </div>
  );
}
