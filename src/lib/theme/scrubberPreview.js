/** When set, syncBrandTheme uses this date instead of today (year scrubber owns the palette). */
let previewDate = null;

export function setScrubberPreviewDate(date) {
  previewDate = date instanceof Date ? date : null;
}

export function getScrubberPreviewDate() {
  return previewDate;
}

export function clearScrubberPreviewDate() {
  previewDate = null;
}

export function isScrubberPreviewActive() {
  return previewDate != null;
}

/** Stable seasonal preview — no special-day spikes or time-of-day drift. */
export const SCRUBBER_MODIFIER_OPTS = {
  enableSpecialDays: false,
  enableTimeOfDay: false,
  enableWeeklyVariation: false,
  enableStreak: false,
};
