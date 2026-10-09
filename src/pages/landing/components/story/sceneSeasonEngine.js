import { getSeasonWeights } from '@/lib/seasonColors';

const TAU = Math.PI * 2;
const SEASON_KEYS = ['spring', 'summer', 'autumn', 'winter'];

// The scene has its own light art direction, but it is driven by the exact same
// cosine weights as the DOM theme. Mixing happens in OKLab/OKLCH so seasonal
// boundaries never pass through a muddy RGB midpoint.
const LIGHT_ANCHORS = {
  spring: { l: 0.79, c: 0.14, h: 148 },
  summer: { l: 0.76, c: 0.145, h: 218 },
  autumn: { l: 0.72, c: 0.155, h: 48 },
  winter: { l: 0.75, c: 0.075, h: 252 },
};

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function linearToSrgb(value) {
  const channel = Math.max(0, value);
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function oklabToSrgb(l, a, b) {
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b;
  const linearL = lRoot ** 3;
  const linearM = mRoot ** 3;
  const linearS = sRoot ** 3;

  return [
    clamp01(linearToSrgb(4.0767416621 * linearL - 3.3077115913 * linearM + 0.2309699292 * linearS)),
    clamp01(
      linearToSrgb(-1.2684380046 * linearL + 2.6097574011 * linearM - 0.3413193965 * linearS),
    ),
    clamp01(linearToSrgb(-0.0041960863 * linearL - 0.7034186147 * linearM + 1.707614701 * linearS)),
  ];
}

function mixLight(weights, hueOffset = 0, lightnessOffset = 0) {
  let l = 0;
  let a = 0;
  let b = 0;

  for (const season of SEASON_KEYS) {
    const weight = weights[season] || 0;
    const anchor = LIGHT_ANCHORS[season];
    const hue = ((anchor.h + hueOffset) / 360) * TAU;
    l += (anchor.l + lightnessOffset) * weight;
    a += Math.cos(hue) * anchor.c * weight;
    b += Math.sin(hue) * anchor.c * weight;
  }

  return oklabToSrgb(l, a, b);
}

function daysInYear(year) {
  return Math.round((Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000);
}

export function dayOfYearProgress(date = new Date()) {
  const year = date.getFullYear();
  const day = Math.floor(
    (Date.UTC(year, date.getMonth(), date.getDate()) - Date.UTC(year, 0, 1)) / 86_400_000,
  );
  const dayFraction =
    (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) / 86_400;
  return (day + dayFraction) / daysInYear(year);
}

export function createSeasonLightLut(date = new Date(), hemisphere = 'north') {
  const year = date.getFullYear();
  const length = daysInYear(year);
  const entries = Array.from({ length }, (_, dayIndex) => {
    const sampleDate = new Date(year, 0, dayIndex + 1, 12);
    const weights = getSeasonWeights(sampleDate, hemisphere);

    return {
      personA: mixLight(weights, -8, 0.012),
      personB: mixLight(weights, 9, -0.006),
      pear: mixLight(weights),
      weights: SEASON_KEYS.map((season) => weights[season] || 0),
    };
  });

  return { entries, length, year };
}

export function sampleSeasonLightLut(lut, yearProgress) {
  const wrapped = ((yearProgress % 1) + 1) % 1;
  const exactIndex = wrapped * lut.length;
  const index = Math.floor(exactIndex) % lut.length;
  const nextIndex = (index + 1) % lut.length;
  const mix = exactIndex - Math.floor(exactIndex);
  const current = lut.entries[index];
  const next = lut.entries[nextIndex];
  const lerpArray = (a, b) => a.map((value, channel) => value + (b[channel] - value) * mix);

  return {
    dayIndex: index,
    personA: lerpArray(current.personA, next.personA),
    personB: lerpArray(current.personB, next.personB),
    pear: lerpArray(current.pear, next.pear),
    weights: lerpArray(current.weights, next.weights),
  };
}

export function dateFromYearProgress(lut, yearProgress) {
  const wrapped = ((yearProgress % 1) + 1) % 1;
  return new Date(lut.year, 0, Math.floor(wrapped * lut.length) + 1, 12);
}
