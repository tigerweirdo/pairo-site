import { getSeasonPeakDays } from '@/lib/seasonColors';

export const SEASON_CHIP_LABELS = {
  winter: 'WINTER',
  spring: 'SPRING',
  summer: 'SUMMER',
  autumn: 'AUTUMN',
};

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const SEASON_CHIP_ORDER = ['winter', 'spring', 'summer', 'autumn'];

export function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / 86_400_000) + 1;
}

export function getTotalDaysInYear(year) {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return isLeap ? 366 : 365;
}

export function dayOfYearToPercent(dayOfYear, totalDays) {
  return (dayOfYear / totalDays) * 100;
}

export function percentToDate(percent, year, totalDays) {
  const day = Math.round((percent / 100) * totalDays);
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + Math.max(0, Math.min(day - 1, totalDays - 1)));
  return date;
}

export function percentToDayOfYear(percent, totalDays) {
  const day = Math.round((percent / 100) * totalDays);
  return Math.max(1, Math.min(day, totalDays));
}

export function clampPercent(percent) {
  return Math.max(0.5, Math.min(99.5, percent));
}

export function getPointerPercent(event, element) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  return ((clientX - rect.left) / rect.width) * 100;
}

/** Mid-season percent for reduced-motion chips (meteorological peak days). */
export function getSeasonMidPercents(totalDays, hemisphere = 'north') {
  const peaks = getSeasonPeakDays(hemisphere);
  return SEASON_CHIP_ORDER.map((key) => ({
    key,
    label: SEASON_CHIP_LABELS[key],
    percent: dayOfYearToPercent(peaks[key], totalDays),
  }));
}
