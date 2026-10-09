export const NAV_LINKS = [
  { label: 'The reveal', href: '#story-day' },
  { label: 'The year', href: '#seasonal' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Questions', href: '#faq' },
];

export const APP_URL = String(import.meta.env.VITE_PEAR_APP_URL ?? '').trim();
export const CTA_HREF = APP_URL || '#share';
