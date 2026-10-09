import { useEffect, useRef, useState } from 'react';
import { DEMO_COUPLE } from '@/constants/demoCouple';
import {
  getPhoneLogicalHeight,
  PHONE_LOGICAL_WIDTH,
  PHONE_SHELL_RADIUS,
} from '@/pages/landing/components/phone/IPhoneFrame';

/** Screenshot reference — hero + pairing mocks stay visually locked to product Home */
export const HERO_SPARK = {
  category: 'Fun',
  text: 'If you could eat only one food forever, what would it be?',
};

export const SHARED_DATE = { day: 'Wednesday', date: 'May 27' };

/** Second phone starts at ~49% of first phone width (consistent overlap). */
export const PHONE_OVERLAP_RATIO = 0.49;
export const PHONE_STAGGER_Y = 35;
/** Tilt + drop shadow — stage height buffer so phones aren't clipped. */
export const PHONE_STAGE_OVERFLOW = 56;
export const PHONE_MIN_SCALE = 0.36;
export const PHONE_MAX_SCALE = 0.72;
/** Hero — smaller than pairing mock so first viewport fits. */
export const HERO_PHONE_MAX_SCALE = 0.58;
export const HERO_PHONE_MAX_WIDTH = 540;
export const PHONE_COMPOSITION_WIDTH_RATIO = 1 + PHONE_OVERLAP_RATIO;

export function buildJesseData(sparkQuestion = HERO_SPARK) {
  return {
    greetingName: DEMO_COUPLE.jesse.homeName,
    greeting: 'Good morning',
    dateLine: SHARED_DATE,
    yourDay: {
      count: '2 THINGS',
      title: 'a calm day, two things',
      pills: [
        { text: '5 items on shopping list' },
        { text: '123 · check in', trailing: 'tonight' },
      ],
    },
    sparkQuestion,
    feedCards: [
      {
        type: 'period',
        iconText: 'd33',
        label: 'LUTEAL · DAY 33 OF 28',
        title: 'Next period starts today',
      },
      {
        type: 'special',
        label: 'SPECIAL DAY · IN 50 DAYS',
        title: DEMO_COUPLE.jesse.homeName,
      },
    ],
  };
}

export function buildCelineData(sparkQuestion = HERO_SPARK) {
  return {
    greetingName: DEMO_COUPLE.celine.homeName,
    greeting: 'Good morning',
    dateLine: SHARED_DATE,
    yourDay: {
      count: '3 THINGS',
      title: 'a slow morning, then out',
      pills: [{ text: 'yoga · 9am' }, { text: 'groceries', trailing: 'after' }],
    },
    sparkQuestion,
    feedCards: [
      {
        type: 'period',
        iconText: 'd8',
        label: 'FOLLICULAR · DAY 8 OF 28',
        title: 'Feeling good today',
      },
      {
        type: 'special',
        label: 'SPECIAL DAY · IN 50 DAYS',
        title: DEMO_COUPLE.jesse.homeName,
      },
    ],
  };
}

export function computeSoloPhoneLayout(containerWidth, { maxScale = 0.62 } = {}) {
  const logicalHeight = getPhoneLogicalHeight();
  const scale = Math.min(
    maxScale,
    Math.max(PHONE_MIN_SCALE, (containerWidth * 0.92) / PHONE_LOGICAL_WIDTH),
  );
  const phoneWidth = PHONE_LOGICAL_WIDTH * scale;
  const phoneHeight = Math.ceil(logicalHeight * scale);
  const shellRadius = PHONE_SHELL_RADIUS * scale;

  return {
    scale,
    phoneWidth,
    phoneHeight,
    shellRadius,
    stageHeight: phoneHeight + 20,
  };
}

export function computePhoneLayout(
  containerWidth,
  { maxScale = PHONE_MAX_SCALE, stageOverflow = PHONE_STAGE_OVERFLOW } = {},
) {
  const logicalHeight = getPhoneLogicalHeight();
  const compositionBaseWidth = PHONE_LOGICAL_WIDTH * PHONE_COMPOSITION_WIDTH_RATIO;
  const scale = Math.min(
    maxScale,
    Math.max(PHONE_MIN_SCALE, containerWidth / compositionBaseWidth),
  );
  const phoneWidth = PHONE_LOGICAL_WIDTH * scale;
  const phoneHeight = Math.ceil(logicalHeight * scale);
  const shellRadius = PHONE_SHELL_RADIUS * scale;
  const rightLeft = phoneWidth * PHONE_OVERLAP_RATIO;
  const rightTop = PHONE_STAGGER_Y * scale;
  const stageHeight = phoneHeight + rightTop + stageOverflow;
  const centerOffset = Math.max(0, (containerWidth - phoneWidth) / 2);

  return {
    scale,
    phoneWidth,
    phoneHeight,
    shellRadius,
    rightLeft,
    rightTop,
    stageHeight,
    centerOffset,
  };
}

function getInitialContainerWidth(maxWidth = 680) {
  if (typeof window === 'undefined') return 360;
  return Math.min(maxWidth, Math.max(320, window.innerWidth - 48));
}

export function usePhoneMockLayout({
  maxWidth = 680,
  maxScale = PHONE_MAX_SCALE,
  stageOverflow,
  solo = false,
} = {}) {
  const compute = solo ? computeSoloPhoneLayout : computePhoneLayout;
  const layoutOpts = solo ? { maxScale } : { maxScale, stageOverflow };

  const containerRef = useRef(null);
  const [layout, setLayout] = useState(() =>
    compute(getInitialContainerWidth(maxWidth), layoutOpts),
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const update = () => {
      setLayout(compute(element.clientWidth, layoutOpts));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
    // compute/layoutOpts are derived from these primitives — listing them directly avoids re-running on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxScale, solo, stageOverflow]);

  return { containerRef, layout };
}
