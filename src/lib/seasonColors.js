/**
 * Seasonal Dynamic Color System v3.0
 * ===================================
 * Provides smooth daily color transitions throughout the year.
 *
 * Season Colors (Romantic Seasons palette):
 * - Winter:  Slate — blue gray (hue ~220)
 * - Spring:  Emerald — vivid deep green (hue ~150)
 * - Summer:  Warm pastel blue — periwinkle sky + lagoon turquoise (hue ~222→198)
 * - Autumn:  Amber + Rust (hue ~38→10)
 *
 * Transition Logic:
 * - Each season has a "peak" day
 * - Colors intensify (saturation increases) as the peak approaches
 * - Each season also has intra-season intensity variation
 * - Cosine-based smooth interpolation
 *
 * Ambient wash: HSLA from palette (no RGB averaging at season boundaries — cleaner transitions).
 *
 * Color Modifier System (v3.0 new):
 * - Time of day: morning pastel, midday vivid, night dark
 * - Couple streak: colors get more vivid as streak increases
 * - Special days: custom palette override for specific dates
 * - Weekly hue variation: seed-based slight shift
 */

import { STORAGE_KEYS, storageGetRaw, storageSetRaw } from './storage.js';

// ─────────────────────────────────────────────────────────────────────────────
// SEASON_COLORS — Romantic Seasons palette
// ─────────────────────────────────────────────────────────────────────────────

export const SEASON_COLORS = {
  winter: {
    name: 'Winter',
    hue: 220,
    saturation: 22,
    lightness: 50,
    saturationRange: { min: 12, max: 28 },
    lightnessRange: { min: 38, max: 60 },
    primary: { h: 220, s: 22, l: 50 },
    secondary: { h: 220, s: 18, l: 62 },
    accent: { h: 218, s: 28, l: 40 },
    background: { h: 220, s: 10, l: 97 },
    darkBase: { h: 225, s: 20, l: 8 },
  },
  spring: {
    name: 'Spring',
    hue: 150,
    saturation: 60,
    lightness: 48,
    saturationRange: { min: 35, max: 65 },
    lightnessRange: { min: 43, max: 55 },
    primary: { h: 150, s: 60, l: 48 },
    secondary: { h: 150, s: 45, l: 60 },
    accent: { h: 148, s: 65, l: 38 },
    background: { h: 150, s: 15, l: 98 },
    darkBase: { h: 150, s: 20, l: 7 },
  },
  summer: {
    name: 'Summer',
    hue: 210,
    saturation: 88,
    lightness: 55,
    saturationRange: { min: 72, max: 94 },
    lightnessRange: { min: 48, max: 62 },
    primary: { h: 210, s: 88, l: 55 },
    secondary: { h: 214, s: 72, l: 70 },
    accent: { h: 192, s: 90, l: 42 },
    background: { h: 210, s: 8, l: 98.5 },
    darkBase: { h: 214, s: 22, l: 10 },
  },
  autumn: {
    name: 'Autumn',
    hue: 28,
    saturation: 78,
    lightness: 52,
    saturationRange: { min: 55, max: 85 },
    lightnessRange: { min: 46, max: 58 },
    primary: { h: 38, s: 80, l: 52 },
    secondary: { h: 22, s: 72, l: 56 },
    accent: { h: 10, s: 72, l: 48 },
    background: { h: 30, s: 15, l: 98 },
    darkBase: { h: 25, s: 18, l: 7 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR_MODIFIERS — v3.0
// Her modifier { hueShift, satMult, lightShift, opacity } döndürür.
// applySeasonalColors bu modifier'ları base palette üzerine katlar.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Özel günler — { 'MM-DD': { name, hueShift, satMult, lightShift, gradientOverride?, textGradient?, avatarGradient?, cardBorderGradient? } }
 *
 * gradientOverride:     [start, mid, end] hsla/rgba — arka plan wash blob'ları
 * textGradient:         CSS gradient string — --gradient-text override (başlıklar, isimler)
 * avatarGradient:       CSS gradient string — --seasonal-avatar-gradient override
 * cardBorderGradient:   CSS gradient string — --seasonal-card-border-gradient (aurora border)
 *
 * Tasarım dili: Her gün tek “analog” renk yolu — hue sürekli kayar, tamamlayıcı sıçrama yok.
 * Wash / metin / avatar / border aynı aileden; L ve S eğrileri resimsi (yüksek ışık → derin gölge).
 */
// SPECIAL_DAYS data is lazy-loaded to reduce main bundle size.
// The data file (~140 lines) is only fetched when a special day is actually checked.
let _specialDays = null;
let _specialDaysPromise = null;

function loadSpecialDays() {
  if (_specialDays) return Promise.resolve(_specialDays);
  if (!_specialDaysPromise) {
    _specialDaysPromise = import('./seasonColors.data.js').then((m) => {
      _specialDays = m.default;
      return _specialDays;
    });
  }
  return _specialDaysPromise;
}

// Eagerly start loading (non-blocking) so it's ready by the time it's needed
loadSpecialDays();

// Backward-compat: export a Proxy that loads synchronously once cached
export const SPECIAL_DAYS = new Proxy(
  {},
  {
    get(_, key) {
      return _specialDays?.[key];
    },
    has(_, key) {
      return _specialDays ? key in _specialDays : false;
    },
    ownKeys() {
      return _specialDays ? Object.keys(_specialDays) : [];
    },
    getOwnPropertyDescriptor(_, key) {
      if (_specialDays && key in _specialDays)
        return { configurable: true, enumerable: true, value: _specialDays[key] };
      return undefined;
    },
  },
);

/**
 * Günün saatine göre modifier hesaplar.
 * - 05-09: sabah — pastel, açık, hafif warm
 * - 10-16: öğlen — tam canlılık, neutral
 * - 17-20: akşam — warm shift, biraz koyu
 * - 21-04: gece — desature, koyu, cool shift
 */
export function getTimeOfDayModifier(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 10) {
    // Sabah: pastel, açık
    return { hueShift: 5, satMult: 0.82, lightShift: 6, label: 'morning' };
  }
  if (hour >= 10 && hour < 17) {
    // Öğlen: tam canlılık
    return { hueShift: 0, satMult: 1.0, lightShift: 0, label: 'noon' };
  }
  if (hour >= 17 && hour < 21) {
    // Akşam: warm, hafif koyu
    return { hueShift: -8, satMult: 1.08, lightShift: -3, label: 'evening' };
  }
  // Gece: cool, desature, koyu
  return { hueShift: 10, satMult: 0.65, lightShift: -8, label: 'night' };
}

/**
 * Çift streaki modifier.
 * streak 0 → soluk, streak 30+ → tam canlılık + hafif warm boost
 * @param {number} streakDays - kaç günlük streak
 */
export function getStreakModifier(streakDays = 0) {
  const clamped = Math.min(streakDays, 60);
  // 0 streak → satMult 0.75, 30+ → 1.15
  const t = clamped / 30;
  const satMult = 0.75 + Math.min(t, 1) * 0.4;
  // Slight warm hue shift over 30+ day streaks
  const hueShift = clamped >= 30 ? -5 : 0;
  const lightShift = clamped >= 30 ? 2 : 0;

  return { hueShift, satMult, lightShift, label: `streak-${clamped}` };
}

/**
 * Haftalık hue varyasyonu — seed olarak yılın haftasını kullanır.
 * Her hafta hafif deterministik hue kayması.
 * @param {Date} date
 */
export function getWeeklyVariationModifier(date = new Date()) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(dayOfYear / 7);

  // Basit deterministik hash
  const seed = (weekNumber * 2654435761) >>> 0;
  const normalized = (seed % 1000) / 1000; // 0-1

  // Slight hue shift between -12 and +12
  const hueShift = Math.round((normalized - 0.5) * 24);
  // saturation çok az değişsin
  const satMult = 0.92 + normalized * 0.16; // 0.92 - 1.08 arası

  return { hueShift, satMult, lightShift: 0, label: `week-w${weekNumber}` };
}

/**
 * Özel gün modifier'ını döndürür (yoksa null).
 * @param {Date} date
 */
export function getSpecialDayModifier(date = new Date()) {
  if (!_specialDays) return null; // data not loaded yet — treat as no special day
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;
  return _specialDays[key] || null;
}

/**
 * Çift özel günü `id` (UUID string) için deterministik hue (0–359).
 * @param {string} id
 * @returns {number}
 */
export function hashSpecialDayIdToHue(id) {
  const str = String(id ?? '');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

/**
 * API'den gelen çift özel günü için tema modifier'ı (saf fonksiyon, DOM yok).
 * `hueShift`, mevsim primary hue ile `targetHue` arasında en kısa yay üzerinden hesaplanır.
 *
 * @param {{ id: string, name: string, date: string, repeat_annual: boolean }} specialDay
 * @param {number} basePrimaryHue — `getSeasonalColorPalette(...).colors.primary.h` (modifier öncesi)
 * @returns {Object} getCombinedModifier çıktısı ile uyumlu alanlar + gradyan string'leri
 */
export function generateUserDayModifier(specialDay, basePrimaryHue) {
  const targetHue = hashSpecialDayIdToHue(specialDay.id);
  const hueShift = ((targetHue - basePrimaryHue + 540) % 360) - 180;

  const mainS = 58;
  const mainL = 51;
  const h1 = targetHue;
  const h2 = (targetHue + 38) % 360;
  const h3 = (targetHue + 168) % 360;
  const h4 = (targetHue + 212) % 360;

  const lightHsl = { h: h1, s: Math.max(mainS - 12, 22), l: Math.min(mainL + 20, 88) };
  const mainHsl = { h: h1, s: mainS, l: mainL };
  const darkHsl = { h: h1, s: Math.min(mainS + 6, 100), l: Math.max(mainL - 11, 26) };
  const deepHsl = { h: h3, s: Math.min(mainS + 4, 92), l: Math.max(mainL - 18, 20) };

  const gradientOverride = [
    `hsla(${h2}, ${Math.min(mainS + 6, 68)}%, 62%, 0.26)`,
    `hsla(${h1}, ${mainS}%, 48%, 0.17)`,
    `hsla(${h4}, ${Math.min(mainS + 10, 72)}%, 44%, 0.12)`,
  ];

  const mist = { h: h2, s: Math.max(mainS - 18, 18), l: Math.min(mainL + 24, 92) };
  const textGradient = `linear-gradient(128deg, ${hslToCSS(mist, true)} 0%, ${hslToCSS(lightHsl, true)} 22%, ${hslToCSS(mainHsl, true)} 48%, ${hslToCSS(darkHsl, true)} 72%, ${hslToCSS(deepHsl, true)} 100%)`;
  const avatarGradient = `linear-gradient(130deg, ${hslToCSS({ ...mist, l: Math.min(mist.l + 3, 94) }, true)} 0%, ${hslToCSS(lightHsl, true)} 28%, ${hslToCSS(mainHsl, true)} 55%, ${hslToCSS(deepHsl, true)} 100%)`;
  const cardBorderGradient = `linear-gradient(122deg, ${hslToCSS(lightHsl, true)}, ${hslToCSS(mainHsl, true)}, ${hslToCSS(deepHsl, true)})`;

  return {
    hueShift,
    satMult: 1.25,
    lightShift: 2,
    gradientOverride,
    textGradient,
    avatarGradient,
    cardBorderGradient,
    isSpecialDay: true,
    label: specialDay.name,
    userDay: true,
  };
}

/**
 * Tüm aktif modifier'ları birleştirir.
 * Öncelik: userModifier > cultural SPECIAL_DAYS > streak + timeOfDay + weeklyHue
 * specialDay varsa hue tamamen override edilir, diğerleri yine katlanır.
 *
 * @param {Object} opts
 * @param {Date}   opts.date
 * @param {number} opts.streakDays
 * @param {boolean} opts.enableTimeOfDay
 * @param {boolean} opts.enableStreak
 * @param {boolean} opts.enableWeeklyVariation
 * @param {boolean} opts.enableSpecialDays
 * @param {Object} [opts.userModifier] — generateUserDayModifier çıktısı
 */
export function getCombinedModifier({
  date = new Date(),
  streakDays = 0,
  enableTimeOfDay = true,
  enableStreak = true,
  enableWeeklyVariation = true,
  enableSpecialDays = true,
  userModifier,
} = {}) {
  const time = enableTimeOfDay
    ? getTimeOfDayModifier(date)
    : { hueShift: 0, satMult: 1, lightShift: 0 };
  const streak = enableStreak
    ? getStreakModifier(streakDays)
    : { hueShift: 0, satMult: 1, lightShift: 0 };
  const weeklyHue = enableWeeklyVariation
    ? getWeeklyVariationModifier(date)
    : { hueShift: 0, satMult: 1, lightShift: 0 };
  const special = enableSpecialDays ? getSpecialDayModifier(date) : null;

  if (userModifier) {
    return {
      ...userModifier,
      satMult: userModifier.satMult * streak.satMult,
      isSpecialDay: true,
      label: userModifier.label ?? userModifier.name ?? 'Special',
    };
  }

  if (special) {
    // On special days, still multiply streak satMult; gradient fields in single object (applySeasonalColors)
    return {
      hueShift: special.hueShift,
      satMult: special.satMult * streak.satMult,
      lightShift: special.lightShift,
      gradientOverride: special.gradientOverride || null,
      textGradient: special.textGradient,
      avatarGradient: special.avatarGradient,
      cardBorderGradient: special.cardBorderGradient,
      label: special.name,
      isSpecialDay: true,
    };
  }

  return {
    hueShift: time.hueShift + streak.hueShift + weeklyHue.hueShift,
    satMult: time.satMult * streak.satMult * weeklyHue.satMult,
    lightShift: time.lightShift + streak.lightShift,
    gradientOverride: null,
    label: `${time.label} / ${streak.label} / ${weeklyHue.label}`,
    isSpecialDay: false,
  };
}

/**
 * Modifier'ı bir HSL rengine uygular.
 */
function applyModifierToColor(color, modifier) {
  const h = (((color.h + modifier.hueShift) % 360) + 360) % 360;
  const s = Math.round(Math.min(100, Math.max(0, color.s * modifier.satMult)));
  const l = Math.round(Math.min(95, Math.max(5, color.l + modifier.lightShift)));
  return { h, s, l };
}

// ─────────────────────────────────────────────────────────────────────────────
// Season order and peak days (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const SEASON_ORDER = ['winter', 'spring', 'summer', 'autumn'];

/** pear chunky icon set — anchor hexes per season; blended with same weights as theme palette. */
const PEAR_ICON_HEX_BY_SEASON = {
  winter: { stroke: '#3A4050', primary: '#A0C5E0', secondary: '#C8C0D8', accent: '#D8E5F0' },
  spring: { stroke: '#5C4A5E', primary: '#FF8FA3', secondary: '#C5B8E8', accent: '#B8E0B8' },
  /* stroke: soğuk nötr gri-mavi (#6B758C) yerine yaz primary (~222°) ile hizalı sıcak lavanta-gri */
  summer: { stroke: '#1A5A8A', primary: '#4AABEC', secondary: '#7EC8F5', accent: '#00BCD4' },
  autumn: { stroke: '#4A3028', primary: '#E07850', secondary: '#D4A855', accent: '#C8887A' },
};

function pearHexToRgb(hex) {
  const h = String(hex).replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function pearRgbToHex(r, g, b) {
  const c = (n) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function blendPearIconCSSVars(weights) {
  const channels = ['stroke', 'primary', 'secondary', 'accent'];
  const result = {};
  for (const ch of channels) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const season of SEASON_ORDER) {
      const w = weights[season] ?? 0;
      const rgb = pearHexToRgb(PEAR_ICON_HEX_BY_SEASON[season][ch]);
      r += rgb.r * w;
      g += rgb.g * w;
      b += rgb.b * w;
    }
    result[ch] = pearRgbToHex(r, g, b);
  }
  return result;
}

/** Rec. 709 luma — tek renge yaklaştırarak doygunluğu düşürür (0 = değişmez, 1 = gri). */
function desaturatePearHex(hex, amount) {
  if (amount <= 0) return hex;
  const { r, g, b } = pearHexToRgb(hex);
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return pearRgbToHex(r + (y - r) * amount, g + (y - g) * amount, b + (y - b) * amount);
}

/** Mevsim karışımından sonra: ikonlarda yalnızca iki renk — kontur (stroke) + dolgu (hepsi secondary). */
const PEAR_ICON_FILL_DESAT = 0.34;
const PEAR_ICON_STROKE_DESAT = 0.08;

function finalizePearIconCSSVars(weights) {
  const base = blendPearIconCSSVars(weights);
  const fill = desaturatePearHex(base.secondary, PEAR_ICON_FILL_DESAT);
  const stroke = desaturatePearHex(base.stroke, PEAR_ICON_STROKE_DESAT);
  return {
    stroke,
    primary: fill,
    secondary: fill,
    accent: fill,
  };
}

const SEASON_PEAK_DAYS_NORTH = {
  winter: 15,
  spring: 106,
  summer: 197,
  autumn: 288,
};

const SEASON_PEAK_DAYS_SOUTH = {
  summer: 15,
  autumn: 106,
  winter: 197,
  spring: 288,
};

export function getSeasonPeakDays(hemisphere = 'north') {
  return hemisphere === 'south' ? SEASON_PEAK_DAYS_SOUTH : SEASON_PEAK_DAYS_NORTH;
}

/** Jan–Dec scrubber: meteorological months per hemisphere (winter wraps Dec + Jan–Feb). */
const METEOROLOGICAL_BAR_MONTHS_NORTH = [
  { key: 'winter', label: 'WINTER', months: [0, 1] },
  { key: 'spring', label: 'SPRING', months: [2, 3, 4] },
  { key: 'summer', label: 'SUMMER', months: [5, 6, 7] },
  { key: 'autumn', label: 'AUTUMN', months: [8, 9, 10] },
  { key: 'winter', label: 'WINTER', months: [11] },
];

const METEOROLOGICAL_BAR_MONTHS_SOUTH = [
  { key: 'summer', label: 'SUMMER', months: [0, 1] },
  { key: 'autumn', label: 'AUTUMN', months: [2, 3, 4] },
  { key: 'winter', label: 'WINTER', months: [5, 6, 7] },
  { key: 'spring', label: 'SPRING', months: [8, 9, 10] },
  { key: 'summer', label: 'SUMMER', months: [11] },
];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Meteorological season blocks for the year scrubber (month boundaries, leap-year aware). */
export function getMeteorologicalBarSegments(year, hemisphere = 'north') {
  const template =
    hemisphere === 'south' ? METEOROLOGICAL_BAR_MONTHS_SOUTH : METEOROLOGICAL_BAR_MONTHS_NORTH;

  return template.map((segment, index) => ({
    ...segment,
    id: `${segment.key}-${index}`,
    days: segment.months.reduce((sum, month) => sum + daysInMonth(year, month), 0),
  }));
}

const TRANSITION_WIDTH = 45;

const SEASON_MONTH_CONFIG_NORTH = {
  winter: { months: [11, 0, 1], peakDay: 46, totalDays: 90 },
  spring: { months: [2, 3, 4], peakDay: 46, totalDays: 92 },
  summer: { months: [5, 6, 7], peakDay: 46, totalDays: 92 },
  autumn: { months: [8, 9, 10], peakDay: 45, totalDays: 91 },
};

const SEASON_MONTH_CONFIG_SOUTH = {
  summer: { months: [11, 0, 1], peakDay: 46, totalDays: 90 },
  autumn: { months: [2, 3, 4], peakDay: 46, totalDays: 92 },
  winter: { months: [5, 6, 7], peakDay: 46, totalDays: 92 },
  spring: { months: [8, 9, 10], peakDay: 45, totalDays: 91 },
};

function getSeasonMonthConfig(hemisphere = 'north') {
  return hemisphere === 'south' ? SEASON_MONTH_CONFIG_SOUTH : SEASON_MONTH_CONFIG_NORTH;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDayDistance(day1, day2, yearLength = 365) {
  const diff = Math.abs(day1 - day2);
  return Math.min(diff, yearLength - diff);
}

function cosineWeight(distance, width) {
  if (distance >= width * 2) return 0;
  return Math.max(0, (1 + Math.cos(((distance / width) * Math.PI) / 2)) / 2);
}

const MONTH_TO_SEASON_NORTH = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
];

const MONTH_TO_SEASON_SOUTH = [
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
];

export function getCurrentSeason(date = new Date(), hemisphere = 'north') {
  const map = hemisphere === 'south' ? MONTH_TO_SEASON_SOUTH : MONTH_TO_SEASON_NORTH;
  return map[date.getMonth()];
}

// ── Hemisphere detection ────────────────────────────────────────────

const SOUTHERN_TIMEZONES = [
  'Australia/',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'America/Buenos_Aires',
  'America/Argentina/',
  'America/Sao_Paulo',
  'America/Montevideo',
  'America/Santiago',
  'America/Lima',
  'Africa/Johannesburg',
  'Africa/Harare',
  'Antarctica/',
];

export function getStoredHemisphere() {
  try {
    return storageGetRaw(STORAGE_KEYS.HEMISPHERE_PREFERENCE, 'auto');
  } catch {
    return 'auto';
  }
}

export function saveHemisphere(value) {
  try {
    storageSetRaw(STORAGE_KEYS.HEMISPHERE_PREFERENCE, value);
  } catch {}
}

function fallbackHemisphereByTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (SOUTHERN_TIMEZONES.some((prefix) => tz.startsWith(prefix))) return 'south';
  } catch {}
  const offset = new Date().getTimezoneOffset() / -60;
  if (offset > 10) return 'south';
  return 'north';
}

export async function detectHemisphere() {
  const stored = getStoredHemisphere();
  if (stored === 'north' || stored === 'south') return stored;
  if (!navigator.geolocation) return fallbackHemisphereByTimezone();
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords.latitude < -10 ? 'south' : 'north'),
      () => resolve(fallbackHemisphereByTimezone()),
      { timeout: 5000, maximumAge: 86400000 },
    );
  });
}

export function resolveHemisphereSync() {
  const stored = getStoredHemisphere();
  if (stored === 'north' || stored === 'south') return stored;
  return fallbackHemisphereByTimezone();
}

export function getNextSeason(currentSeason) {
  const idx = SEASON_ORDER.indexOf(currentSeason);
  return SEASON_ORDER[(idx + 1) % SEASON_ORDER.length];
}

export function getPreviousSeason(currentSeason) {
  const idx = SEASON_ORDER.indexOf(currentSeason);
  return SEASON_ORDER[(idx - 1 + SEASON_ORDER.length) % SEASON_ORDER.length];
}

export function getSeasonDates(year, hemisphere = 'north') {
  const ranges = {
    q1: { start: new Date(year - 1, 11, 1), end: new Date(year, 2, 0) },
    q2: { start: new Date(year, 2, 1), end: new Date(year, 4, 31) },
    q3: { start: new Date(year, 5, 1), end: new Date(year, 7, 31) },
    q4: { start: new Date(year, 8, 1), end: new Date(year, 10, 30) },
    tail: { start: new Date(year, 11, 1), end: new Date(year, 11, 31) },
  };
  if (hemisphere === 'south') {
    return {
      summer: ranges.q1,
      autumn: ranges.q2,
      winter: ranges.q3,
      spring: ranges.q4,
      summerEnd: ranges.tail,
    };
  }
  return {
    winter: ranges.q1,
    spring: ranges.q2,
    summer: ranges.q3,
    autumn: ranges.q4,
    winterEnd: ranges.tail,
  };
}

export function getSeasonWeights(date = new Date(), hemisphere = 'north') {
  const dayOfYear = getDayOfYear(date);
  const year = date.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const yearLength = isLeapYear ? 366 : 365;
  const peakDays = getSeasonPeakDays(hemisphere);
  const wrapSeason = hemisphere === 'south' ? 'summer' : 'winter';

  const weights = {};
  let totalWeight = 0;

  for (const season of SEASON_ORDER) {
    let peakDay = peakDays[season];
    if (season === wrapSeason && date.getMonth() === 11) {
      peakDay = yearLength + peakDays[season];
    }
    const distance = getDayDistance(dayOfYear, peakDay, yearLength);
    const weight = cosineWeight(distance, TRANSITION_WIDTH);
    weights[season] = weight;
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    for (const season of SEASON_ORDER) weights[season] /= totalWeight;
  } else {
    const currentSeason = getCurrentSeason(date, hemisphere);
    for (const season of SEASON_ORDER) weights[season] = season === currentSeason ? 1 : 0;
  }

  return weights;
}

export function getSeasonIntensity(date = new Date(), season = null, hemisphere = 'north') {
  const month = date.getMonth();
  const day = date.getDate();
  const targetSeason = season || getCurrentSeason(date, hemisphere);
  const config = getSeasonMonthConfig(hemisphere)[targetSeason];

  if (!config || !config.months.includes(month)) return 0.5;

  let dayOfSeason = 0;
  for (let i = 0; i < config.months.length; i++) {
    if (month === config.months[i]) {
      dayOfSeason += day;
      break;
    } else dayOfSeason += new Date(date.getFullYear(), config.months[i] + 1, 0).getDate();
  }

  const maxDistance = config.totalDays / 2;
  const distance = Math.abs(dayOfSeason - config.peakDay);
  const minIntensity = 0.3;
  const intensity =
    minIntensity + (1 - minIntensity) * Math.cos(((distance / maxDistance) * Math.PI) / 2);
  return Math.max(minIntensity, Math.min(1, intensity));
}

export function getAllSeasonIntensities(date = new Date(), hemisphere = 'north') {
  return {
    winter: getSeasonIntensity(date, 'winter', hemisphere),
    spring: getSeasonIntensity(date, 'spring', hemisphere),
    summer: getSeasonIntensity(date, 'summer', hemisphere),
    autumn: getSeasonIntensity(date, 'autumn', hemisphere),
  };
}

export function getWinterIntensity(date = new Date(), hemisphere = 'north') {
  return getSeasonIntensity(date, 'winter', hemisphere);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Ağırlıklı HSL karışımı. Hue için vektör bileşenleri yalnızca takvim `weight` ile ölçülür;
 * `weight * (s/100)` kullanımı yüksek doygunluklu komşu mevsimi (ör. ilkbahar) düşük-S pastel
 * yaz rengine göre hue’yu fazla çekiyordu — geçişlerde çamur / yanlış sıcaklık hissi.
 * S ve L yine ağırlıklı ortalama.
 */
function blendMultipleHSL(colors) {
  if (colors.length === 0) return { h: 0, s: 0, l: 50 };
  if (colors.length === 1) return { ...colors[0].color };

  let totalWeight = 0;
  let hX = 0,
    hY = 0,
    s = 0,
    l = 0;

  for (const { color, weight } of colors) {
    if (weight <= 0) continue;
    totalWeight += weight;
    const hRad = (color.h * Math.PI) / 180;
    hX += Math.cos(hRad) * weight;
    hY += Math.sin(hRad) * weight;
    s += color.s * weight;
    l += color.l * weight;
  }

  if (totalWeight === 0) return { h: 0, s: 0, l: 50 };

  let h = (Math.atan2(hY, hX) * 180) / Math.PI;
  if (h < 0) h += 360;
  const avgSat = s / totalWeight;
  if (avgSat < 1) h = 0;

  return {
    h: Math.round(h),
    s: Math.round(s / totalWeight),
    l: Math.round(l / totalWeight),
  };
}

function blendSeasonPalettes(weights, date, hemisphere = 'north') {
  const colorTypes = ['primary', 'secondary', 'accent', 'background', 'darkBase'];
  const result = {};
  const intensities = getAllSeasonIntensities(date, hemisphere);

  for (const colorType of colorTypes) {
    const colorWeights = [];

    for (const season of SEASON_ORDER) {
      const weight = weights[season];
      if (weight > 0.001) {
        let color = { ...SEASON_COLORS[season][colorType] };
        const seasonConfig = SEASON_COLORS[season];
        const intensity = intensities[season];

        if (seasonConfig.saturationRange && seasonConfig.lightnessRange) {
          const satRange = seasonConfig.saturationRange;
          const lightRange = seasonConfig.lightnessRange;
          const adjustedS = lerp(satRange.min, satRange.max, intensity);
          let adjustedL;
          if (season === 'winter') {
            adjustedL = lerp(lightRange.max, lightRange.min, intensity);
          } else {
            const midL = (lightRange.min + lightRange.max) / 2;
            adjustedL = lerp(lightRange.max, midL, intensity);
          }
          if (colorType !== 'background') color.s = Math.round(adjustedS);
          if (colorType === 'primary' || colorType === 'accent') {
            color.l = Math.round(adjustedL);
          } else if (colorType === 'secondary') {
            color.l = Math.round(lerp(color.l, adjustedL, 0.5));
          }
        }

        colorWeights.push({ color, weight });
      }
    }

    result[colorType] = blendMultipleHSL(colorWeights);
  }

  return result;
}

function clampChannel(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Ambient “wash” tints from the blended palette (HSLA — avoids muddy RGB averages at season boundaries).
 */
function deriveAmbientWashFromPalette(colors) {
  const p = colors.primary;
  const sec = colors.secondary;
  const acc = colors.accent;
  return {
    start: `hsla(${p.h}, ${clampChannel(Math.round(p.s * 0.28), 5, 38)}%, ${clampChannel(Math.round(92 + p.l * 0.1), 90, 97)}%, 0.1)`,
    mid: `hsla(${sec.h}, ${clampChannel(Math.round(sec.s * 0.22), 4, 34)}%, ${clampChannel(Math.round(89 + sec.l * 0.09), 87, 95)}%, 0.07)`,
    end: `hsla(${acc.h}, ${clampChannel(Math.round(acc.s * 0.18), 3, 30)}%, ${clampChannel(Math.round(86 + acc.l * 0.08), 84, 92)}%, 0.055)`,
  };
}

/** Replace trailing alpha in hsla() / rgba() for accent-wash layering. */
function applyWashOpacity(colorStr, opacity) {
  const s = String(colorStr).trim();
  if (/hsla\s*\(/i.test(s)) return s.replace(/,\s*[\d.]+\s*\)\s*$/, `, ${opacity})`);
  if (/rgba\s*\(/i.test(s)) return s.replace(/,\s*[\d.]+\s*\)\s*$/, `, ${opacity})`);
  return s;
}

export function getSeasonProgress(date = new Date(), hemisphere = 'north') {
  const weights = getSeasonWeights(date, hemisphere);
  const dayOfYear = getDayOfYear(date);
  const currentSeason = getCurrentSeason(date, hemisphere);

  let dominantSeason = currentSeason;
  let maxWeight = 0;
  for (const season of SEASON_ORDER) {
    if (weights[season] > maxWeight) {
      maxWeight = weights[season];
      dominantSeason = season;
    }
  }

  const month = date.getMonth();
  const day = date.getDate();
  const cfg = getSeasonMonthConfig(hemisphere)[currentSeason];
  let dayOfSeason = 0;
  const totalDays = cfg.totalDays;
  for (let i = 0; i < cfg.months.length; i++) {
    if (month === cfg.months[i]) {
      dayOfSeason += day;
      break;
    } else dayOfSeason += new Date(date.getFullYear(), cfg.months[i] + 1, 0).getDate();
  }

  const progress = dayOfSeason / totalDays;

  let secondSeason = null;
  let secondWeight = 0;
  for (const season of SEASON_ORDER) {
    if (season !== dominantSeason && weights[season] > secondWeight) {
      secondWeight = weights[season];
      secondSeason = season;
    }
  }

  const isTransitioning = secondWeight > 0.05;
  const intensities = getAllSeasonIntensities(date, hemisphere);

  return {
    currentSeason,
    dominantSeason,
    dayOfSeason,
    totalDays,
    progress,
    dayOfYear,
    weights,
    isTransitioning,
    transitionFrom: dominantSeason,
    transitionTo: secondSeason,
    blendAmount: secondWeight,
    intensities,
    winterIntensity: intensities.winter,
  };
}

export function getSeasonalColorPalette(date = new Date(), hemisphere = 'north') {
  const weights = getSeasonWeights(date, hemisphere);
  const progress = getSeasonProgress(date, hemisphere);
  const colors = blendSeasonPalettes(weights, date, hemisphere);
  const gradients = deriveAmbientWashFromPalette(colors);

  let dominantSeason = progress.dominantSeason;
  let maxWeight = weights[dominantSeason];
  let seasonName = SEASON_COLORS[dominantSeason].name;

  if (progress.isTransitioning && progress.transitionTo) {
    const toPercent = Math.round(progress.blendAmount * 100);
    if (toPercent >= 5) {
      seasonName = `${SEASON_COLORS[dominantSeason].name} → ${SEASON_COLORS[progress.transitionTo].name}`;
    }
  }

  const percentages = {};
  for (const season of SEASON_ORDER) percentages[season] = Math.round(weights[season] * 100);

  return {
    season: dominantSeason,
    seasonName,
    isTransitioning: progress.isTransitioning,
    transitionFrom: progress.transitionFrom,
    transitionTo: progress.transitionTo,
    transitionProgress: Math.round(maxWeight * 100),
    blendPercent: Math.round(progress.blendAmount * 100),
    weights,
    percentages,
    colors,
    gradients: { start: gradients.start, mid: gradients.mid, end: gradients.end },
    progress,
    intensities: progress.intensities,
    winterIntensity: progress.winterIntensity,
  };
}

export function hslToCSS(color, withFormat = false) {
  if (withFormat) return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  return `${color.h} ${color.s}% ${color.l}%`;
}

export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, '0');
  g = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0');
  b = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${r}${g}${b}`;
}

/** sRGB relative luminance (WCAG 2.x) from a #rrggbb hex. */
function relativeLuminance(hex) {
  const toLinear = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio (1–21) between two #rrggbb hex colors. */
export function contrastRatio(hexA, hexB) {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Darkens an HSL color (lowering L, slightly boosting S) until it clears `targetRatio`
 * against `bgHex`. Keeps seasonal text legible on the near-white app background no matter
 * what the day's palette is — light hues (e.g. summer sky-blue) get pulled down to AA.
 */
function ensureContrast(h, s, l, bgHex = '#ffffff', targetRatio = 4.5) {
  let lightness = l;
  let saturation = s;
  let hex = hslToHex(h, saturation, lightness);
  // Bounded loop: step L down to a readability floor or until the ratio passes.
  while (lightness > 20 && contrastRatio(hex, bgHex) < targetRatio) {
    lightness -= 2;
    saturation = Math.min(saturation + 1, 100);
    hex = hslToHex(h, saturation, lightness);
  }
  return hex;
}

function generateColorScale(h, s, l) {
  return {
    lightest: hslToHex(h, Math.max(s - 7, 0), Math.min(l + 18, 93)),
    light: hslToHex(h, Math.max(s - 3, 0), Math.min(l + 10, 86)),
    main: hslToHex(h, s, l),
    dark: hslToHex(h, Math.min(s + 4, 100), Math.max(l - 7, 24)),
    darker: hslToHex(h, Math.min(s + 7, 100), Math.max(l - 13, 18)),
    darkest: hslToHex(h, Math.min(s + 9, 100), Math.max(l - 19, 12)),
    // AA-guaranteed text color on the near-white background (used for seasonal links/labels).
    text: ensureContrast(h, s, l, '#ffffff', 4.5),
  };
}

/** Avatar, birincil butonlar, CTA — çok duraklı, yumuşak açı (hafif yumuşatılmış duraklar) */
function buildBrandGradientFromScale(colorScale) {
  return `linear-gradient(127deg, ${colorScale.lightest} 0%, ${colorScale.light} 24%, ${colorScale.main} 52%, ${colorScale.dark} 76%, ${colorScale.darker} 100%)`;
}

/**
 * İki katmanlı birincil buton gölgesi (geniş glow + sıkı kontakt).
 * @param {string} primaryHex — hslToHex çıktısı (#rrggbb)
 * @param {boolean} isDark
 */
export function buildPrimaryButtonShadow(primaryHex, isDark) {
  const base = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`;
  if (isDark) {
    return `0 8px 26px ${base}22, 0 3px 10px ${base}40`;
  }
  return `0 10px 30px ${base}3A, 0 4px 14px ${base}55`;
}

/** Shallow top-to-bottom primary fill for `--seasonal-brand-gradient` (avoids dark side stops). */
export const SEASONAL_BRAND_GRADIENT =
  'linear-gradient(to bottom, hsl(var(--seasonal-primary) / 0.92), hsl(var(--seasonal-primary)))';

export function generateCSSVariables(palette) {
  const { colors, gradients } = palette;
  const colorScale = generateColorScale(colors.primary.h, colors.primary.s, colors.primary.l);

  const lightVars = {
    '--seasonal-primary': hslToCSS(colors.primary),
    '--seasonal-primary-hsl': hslToCSS(colors.primary, true),
    '--seasonal-secondary': hslToCSS(colors.secondary),
    '--seasonal-secondary-hsl': hslToCSS(colors.secondary, true),
    '--seasonal-accent': hslToCSS(colors.accent),
    '--seasonal-accent-hsl': hslToCSS(colors.accent, true),
    '--seasonal-bg': hslToCSS(colors.background),
    '--seasonal-bg-h': colors.background.h,
    '--seasonal-bg-s': colors.background.s,
    '--seasonal-bg-l': colors.background.l,
    '--seasonal-color-lightest': colorScale.lightest,
    '--seasonal-color-light': colorScale.light,
    '--seasonal-color-main': colorScale.main,
    '--seasonal-color-text': colorScale.text,
    '--seasonal-color-dark': colorScale.dark,
    '--seasonal-color-darker': colorScale.darker,
    '--seasonal-color-darkest': colorScale.darkest,
    '--seasonal-gradient-start': gradients.start,
    '--seasonal-gradient-mid': gradients.mid,
    '--seasonal-gradient-end': gradients.end,
    '--seasonal-avatar-gradient': buildBrandGradientFromScale(colorScale),
    '--seasonal-brand-gradient': SEASONAL_BRAND_GRADIENT,
    '--seasonal-ring': `${colors.primary.h} ${colors.primary.s}% ${colors.primary.l}%`,
    '--seasonal-glow': `0 0 20px ${hslToCSS(colors.primary, true)}`,
    '--seasonal-btn-shadow': buildPrimaryButtonShadow(colorScale.main, false),
    '--selection-color': `hsla(${colors.primary.h}, ${colors.primary.s}%, ${colors.primary.l}%, 0.3)`,
  };

  const darkColors = {
    primary: { ...colors.primary, l: Math.max(colors.primary.l - 5, 40) },
    secondary: { ...colors.secondary, l: Math.max(colors.secondary.l - 10, 35) },
    accent: { ...colors.accent, l: Math.max(colors.accent.l - 5, 40) },
    background: colors.darkBase || { h: 210, s: 10, l: 8 },
  };
  const darkColorScale = generateColorScale(
    darkColors.primary.h,
    darkColors.primary.s,
    darkColors.primary.l,
  );

  const cardWashLight = `hsl(${colors.primary.h}, ${Math.round(colors.primary.s * 0.38)}%, 97.5%)`;
  const cardWashDark = `hsl(${darkColors.primary.h}, ${Math.round(darkColors.primary.s * 0.28)}%, 12%)`;
  lightVars['--seasonal-card-wash'] = cardWashLight;

  const darkVars = {
    '--seasonal-primary-dark': hslToCSS(darkColors.primary),
    '--seasonal-secondary-dark': hslToCSS(darkColors.secondary),
    '--seasonal-accent-dark': hslToCSS(darkColors.accent),
    '--seasonal-bg-dark': hslToCSS(darkColors.background),
    '--seasonal-card-dark': `${darkColors.background.h} ${darkColors.background.s}% ${darkColors.background.l + 4}% / 0.6`,
    '--seasonal-popover-dark': `${darkColors.background.h} ${darkColors.background.s}% ${darkColors.background.l + 6}%`,
    '--seasonal-muted-dark': `${darkColors.background.h} ${darkColors.background.s}% ${darkColors.background.l + 8}%`,
    '--seasonal-border-dark': `0 0% 100% / 0.14`,
    '--seasonal-card-wash-dark': cardWashDark,
  };

  return { ...lightVars, ...darkVars, darkColorScale };
}

// ─────────────────────────────────────────────────────────────────────────────
// Registered user special-day modifier (DataProvider bridge + Theme interval)
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Object|undefined} */
let registeredSeasonalUserModifier;

/**
 * Bugünkü çift özel günü modifier'ını kaydeder; ThemeContext periyodik `applySeasonalColors` bunu okur.
 * @param {Object|undefined|null} mod — `generateUserDayModifier` çıktısı veya temizlemek için null/undefined
 */
export function setRegisteredSeasonalUserModifier(mod) {
  registeredSeasonalUserModifier = mod == null ? undefined : mod;
}

export function clearRegisteredSeasonalUserModifier() {
  registeredSeasonalUserModifier = undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme-color meta (iOS Safari tab bar)
// ─────────────────────────────────────────────────────────────────────────────

/** Seasonal primary hex for `<meta name="theme-color">` — mirrors applySeasonalColors modifiers. */
export function getMetaThemeColor(date = new Date(), hemisphere = 'north', isDark = false) {
  const palette = getSeasonalColorPalette(date, hemisphere);
  let activePrimary = palette.colors.primary;
  if (isDark) {
    activePrimary = { ...activePrimary, l: Math.max(activePrimary.l - 5, 40) };
  }
  const modifier = getCombinedModifier({ date });
  const modPrimary = applyModifierToColor(activePrimary, modifier);
  return hslToHex(modPrimary.h, modPrimary.s, modPrimary.l);
}

/** Updates the theme-color meta tag after seasonal or dark-mode changes. */
export function syncThemeColorMeta(date = new Date(), hemisphere = 'north') {
  if (typeof document === 'undefined') return;
  const meta =
    document.getElementById('theme-color-meta') ||
    document.querySelector('meta[name="theme-color"]');
  if (!meta) return;

  const hsl = getComputedStyle(document.documentElement)
    .getPropertyValue('--seasonal-primary-hsl')
    .trim();

  if (hsl) {
    meta.setAttribute('content', hsl);
    return;
  }

  meta.setAttribute('content', getMetaThemeColor(date, hemisphere, false));
}

// ─────────────────────────────────────────────────────────────────────────────
// applySeasonalColors — v3.0 (modifier desteği eklendi)
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_TRANSITION = '1.5s cubic-bezier(0.4, 0, 0.2, 1)';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * CSS değişkenlerini DOM'a uygular.
 *
 * @param {Date}   date
 * @param {string} hemisphere
 * @param {Object} modifierOpts  — getCombinedModifier'a iletilir
 *   @param {number}  modifierOpts.streakDays        - çift streak günü (default 0)
 *   @param {boolean} modifierOpts.enableTimeOfDay   - günün saati modu (default true)
 *   @param {boolean} modifierOpts.enableStreak      - streak modu (default true)
 *   @param {boolean} modifierOpts.enableWeeklyVariation  - haftalık hue varyasyonu (default true)
 *   @param {boolean} modifierOpts.enableSpecialDays - özel günler (default true)
 *   @param {Object}  [modifierOpts.userModifier]    - doğrudan iletilirse kayıtlı modifier yerine bu kullanılır
 *
 * Kullanım örneği:
 *   applySeasonalColors(new Date(), 'north', { streakDays: 14 })
 */
/**
 * Computes seasonal CSS custom properties (shared by DOM apply + HTML boot style).
 * @returns {{ props: Record<string, string>, palette: object, modifier: object, attributes: Record<string, string|boolean> }}
 */
export function computeSeasonalRootStyles(
  date = new Date(),
  hemisphere = 'north',
  modifierOpts = {},
  isDarkMode = false,
) {
  const palette = getSeasonalColorPalette(date, hemisphere);
  const cssVars = generateCSSVariables(palette);
  const props = {};

  Object.entries(cssVars).forEach(([prop, val]) => {
    if (prop !== 'darkColorScale') props[prop] = val;
  });

  const pearIconVars = finalizePearIconCSSVars(palette.weights);
  props['--pear-icon-stroke'] = pearIconVars.stroke;
  props['--pear-icon-primary'] = pearIconVars.primary;
  props['--pear-icon-secondary'] = pearIconVars.secondary;
  props['--pear-icon-accent'] = pearIconVars.accent;

  const { userModifier: optUserModifier, ...restModifierOpts } = modifierOpts;
  const userModifier =
    optUserModifier !== undefined ? optUserModifier : registeredSeasonalUserModifier;
  const modifier = getCombinedModifier({ date, ...restModifierOpts, userModifier });

  let activeColors = { ...palette.colors };
  if (isDarkMode) {
    activeColors = {
      primary: { ...palette.colors.primary, l: Math.max(palette.colors.primary.l - 5, 40) },
      secondary: { ...palette.colors.secondary, l: Math.max(palette.colors.secondary.l - 10, 35) },
      accent: { ...palette.colors.accent, l: Math.max(palette.colors.accent.l - 5, 40) },
      background: palette.colors.darkBase || { h: 210, s: 10, l: 8 },
    };
  }

  const modPrimary = applyModifierToColor(activeColors.primary, modifier);
  const modSecondary = applyModifierToColor(activeColors.secondary, modifier);
  const modAccent = applyModifierToColor(activeColors.accent, modifier);

  props['--primary'] = hslToCSS(modPrimary);
  props['--secondary'] = hslToCSS(modSecondary);
  props['--accent'] = hslToCSS(modAccent);
  props['--ring'] = hslToCSS(modAccent);
  props['--seasonal-primary'] = hslToCSS(modPrimary);
  props['--seasonal-primary-hsl'] = hslToCSS(modPrimary, true);
  props['--seasonal-secondary'] = hslToCSS(modSecondary);
  props['--seasonal-secondary-hsl'] = hslToCSS(modSecondary, true);
  props['--seasonal-accent'] = hslToCSS(modAccent);
  props['--seasonal-accent-hsl'] = hslToCSS(modAccent, true);
  const modPrimaryDark = { ...modPrimary, l: Math.max(modPrimary.l - 5, 38) };
  props['--seasonal-primary-dark'] = hslToCSS(modPrimaryDark);

  const modColorScale = generateColorScale(modPrimary.h, modPrimary.s, modPrimary.l);
  props['--seasonal-color-lightest'] = modColorScale.lightest;
  props['--seasonal-color-light'] = modColorScale.light;
  props['--seasonal-color-main'] = modColorScale.main;
  props['--seasonal-color-text'] = modColorScale.text;
  props['--seasonal-color-dark'] = modColorScale.dark;
  props['--seasonal-color-darker'] = modColorScale.darker;
  props['--seasonal-color-darkest'] = modColorScale.darkest;

  const cwH = modPrimary.h;
  const cwS = modPrimary.s;
  props['--seasonal-card-wash'] = isDarkMode
    ? `hsl(${cwH}, ${Math.round(cwS * 0.28)}%, 12%)`
    : `hsl(${cwH}, ${Math.round(cwS * 0.38)}%, 97.5%)`;

  let bgGradient;
  if (isDarkMode) {
    const { h, s, l } = activeColors.background;
    const sLo = Math.max(s - 3, 6);
    const sHi = Math.min(s + 6, 26);
    bgGradient = `linear-gradient(168deg,
      hsl(${h}, ${sLo}%, ${l}%) 0%,
      hsl(${h}, ${s}%, ${Math.max(l - 1, 5)}%) 42%,
      hsl(${h}, ${sHi}%, ${Math.max(l - 3, 3)}%) 100%)`;
  } else {
    const { h, s } = palette.colors.background;
    const lShift = modifier.lightShift * 0.25;
    const sSoft = Math.max(s * 0.75, 4);
    const sMid = Math.min(s * 1.08, 100);
    bgGradient = `linear-gradient(168deg,
      hsl(${h}, ${sSoft}%, ${Math.min(99.4 + lShift, 99.6)}%) 0%,
      hsl(${h}, ${s}%, ${Math.min(98.7 + lShift, 99.3)}%) 40%,
      hsl(${h}, ${sMid}%, ${Math.min(98.2 + lShift, 99.1)}%) 100%)`;
  }
  props['--bg-gradient'] = bgGradient;

  const washOpacity = isDarkMode ? '0.12' : modifier.isSpecialDay ? '0.34' : '0.26';
  let gradStart = palette.gradients.start;
  let gradMid = palette.gradients.mid;
  let gradEnd = palette.gradients.end;

  if (modifier.gradientOverride) {
    [gradStart, gradMid, gradEnd] = modifier.gradientOverride;
  }

  props['--bg-accent-wash'] = `
    radial-gradient(135% 92% at 17% 10%, ${applyWashOpacity(gradStart, washOpacity)} 0%, transparent 58%),
    radial-gradient(108% 88% at 87% 16%, ${applyWashOpacity(gradMid, washOpacity)} 0%, transparent 62%),
    radial-gradient(118% 78% at 43% 93%, ${applyWashOpacity(gradEnd, washOpacity)} 0%, transparent 54%)`;

  const culturalSpecial = modifier.isSpecialDay ? getSpecialDayModifier(date) : null;

  props['--gradient-text'] =
    modifier.textGradient ??
    culturalSpecial?.textGradient ??
    `linear-gradient(127deg, ${modColorScale.lightest} 0%, ${modColorScale.light} 24%, ${modColorScale.main} 52%, ${modColorScale.dark} 76%, ${modColorScale.darker} 100%)`;

  props['--seasonal-avatar-gradient'] =
    modifier.avatarGradient ??
    culturalSpecial?.avatarGradient ??
    buildBrandGradientFromScale(modColorScale);
  props['--seasonal-brand-gradient'] = SEASONAL_BRAND_GRADIENT;

  props['--seasonal-card-border-gradient'] =
    modifier.cardBorderGradient ??
    culturalSpecial?.cardBorderGradient ??
    `linear-gradient(127deg, ${modColorScale.light} 0%, ${modColorScale.main} 52%, ${modColorScale.dark} 100%)`;

  const primaryHex = hslToHex(modPrimary.h, modPrimary.s, modPrimary.l);
  props['--btn-shadow'] = buildPrimaryButtonShadow(primaryHex, isDarkMode);
  props['--selection-color'] = `hsla(${modPrimary.h}, ${modPrimary.s}%, ${modPrimary.l}%, 0.3)`;

  const attributes = {
    'data-current-season': palette.season,
    'data-color-modifier': modifier.label,
    'data-aurora-border': Boolean(
      modifier.cardBorderGradient || culturalSpecial?.cardBorderGradient,
    ),
  };
  if (modifier.isSpecialDay) {
    attributes['data-special-day'] = modifier.label;
  }

  return { props, palette, modifier, attributes };
}

export function applySeasonalColors(date = new Date(), hemisphere = 'north', modifierOpts = {}) {
  const root = document.documentElement;
  const isDarkMode = false;
  const reducedMotion = prefersReducedMotion();
  const { instant: instantPalette, ...paletteModifierOpts } = modifierOpts;
  const instant = Boolean(instantPalette);

  const { props, palette, modifier, attributes } = computeSeasonalRootStyles(
    date,
    hemisphere,
    paletteModifierOpts,
    isDarkMode,
  );

  root.style.setProperty('--color-transition', reducedMotion || instant ? '0s' : COLOR_TRANSITION);
  root.style.transition =
    reducedMotion || instant
      ? 'none'
      : 'background-color 1.5s ease, color 1.5s ease, border-color 1.5s ease';

  Object.entries(props).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
  });

  if (attributes['data-aurora-border']) {
    root.setAttribute('data-aurora-border', 'true');
  } else {
    root.removeAttribute('data-aurora-border');
  }

  root.setAttribute('data-current-season', attributes['data-current-season']);
  root.setAttribute('data-color-modifier', attributes['data-color-modifier']);
  if (attributes['data-special-day']) {
    root.setAttribute('data-special-day', attributes['data-special-day']);
  } else {
    root.removeAttribute('data-special-day');
  }

  syncThemeColorMeta(date, hemisphere);

  return { palette, modifier };
}

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı export'lar (değişmedi)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Marka gradyanı / logo hex’leri — `applySeasonalColors` ile aynı modifier zinciri
 * (`getCombinedModifier` + kayıtlı çift özel günü), isteğe bağlı karanlık mod primary sıkıştırması.
 *
 * @param {Date} [date]
 * @param {string} [hemisphere]
 * @param {Object} [modifierOpts] — `applySeasonalColors` üçüncü argümanı ile aynı (streakDays, enableTimeOfDay, userModifier, …)
 * @param {boolean} [isDarkMode]
 */
export function getSeasonalHexColors(
  date = new Date(),
  hemisphere = 'north',
  modifierOpts = {},
  isDarkMode = false,
) {
  const palette = getSeasonalColorPalette(date, hemisphere);
  const { userModifier: optUserModifier, ...restModifierOpts } = modifierOpts;
  const userModifier =
    optUserModifier !== undefined ? optUserModifier : registeredSeasonalUserModifier;
  const modifier = getCombinedModifier({ date, ...restModifierOpts, userModifier });

  let activePrimary = palette.colors.primary;
  if (isDarkMode) {
    activePrimary = {
      ...palette.colors.primary,
      l: Math.max(palette.colors.primary.l - 5, 40),
    };
  }

  const modPrimary = applyModifierToColor(activePrimary, modifier);
  const scale = generateColorScale(modPrimary.h, modPrimary.s, modPrimary.l);
  return {
    lightest: scale.lightest,
    light: scale.light,
    main: scale.main,
    dark: scale.dark,
    darker: scale.darker,
    darkest: scale.darkest,
    gradient: buildBrandGradientFromScale(scale),
    confetti: [scale.main, scale.light, scale.dark, '#FFD700', '#FF69B4'],
  };
}

export function getSeasonInfo(date = new Date(), hemisphere = 'north') {
  const palette = getSeasonalColorPalette(date, hemisphere);
  return {
    date: date.toLocaleDateString('en-US'),
    season: palette.season,
    seasonName: palette.seasonName,
    isTransitioning: palette.isTransitioning,
    transitionProgress: palette.transitionProgress,
    percentages: palette.percentages,
    intensities: palette.intensities,
    winterIntensity: palette.winterIntensity,
    colors: {
      primary: hslToCSS(palette.colors.primary, true),
      secondary: hslToCSS(palette.colors.secondary, true),
      accent: hslToCSS(palette.colors.accent, true),
    },
  };
}

export function debugYearColors(hemisphere = 'north') {
  const results = [];
  const year = new Date().getFullYear();
  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= 28; day += 7) {
      const date = new Date(year, month, day);
      const info = getSeasonInfo(date, hemisphere);
      const currentSeason = getCurrentSeason(date, hemisphere);
      const intensity = info.intensities?.[currentSeason] || 0.5;
      const modifier = getCombinedModifier({ date });
      results.push({
        date: info.date,
        hemisphere,
        season: info.season,
        percentages: info.percentages,
        intensity: intensity.toFixed(2),
        primaryColor: info.colors.primary,
        modifierLabel: modifier.label,
      });
    }
  }
  console.table(results);
  return results;
}

export default {
  SEASON_COLORS,
  SPECIAL_DAYS,
  getCurrentSeason,
  getSeasonProgress,
  getSeasonWeights,
  getSeasonIntensity,
  getAllSeasonIntensities,
  getWinterIntensity,
  getSeasonalColorPalette,
  applySeasonalColors,
  generateCSSVariables,
  getCombinedModifier,
  getTimeOfDayModifier,
  getStreakModifier,
  getWeeklyVariationModifier,
  getSpecialDayModifier,
  hashSpecialDayIdToHue,
  generateUserDayModifier,
  setRegisteredSeasonalUserModifier,
  clearRegisteredSeasonalUserModifier,
  hslToCSS,
  hslToHex,
  getSeasonInfo,
  getSeasonalHexColors,
  getMetaThemeColor,
  syncThemeColorMeta,
  debugYearColors,
  detectHemisphere,
  resolveHemisphereSync,
  getStoredHemisphere,
  saveHemisphere,
};
